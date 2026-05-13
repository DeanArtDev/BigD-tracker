# ADR-0002: Архитектура микросервиса auth-service (JWT + Refresh Token, RS256)

- Статус: Одобрено
- Дата: 2026-05-08
- Авторы: <имя>
- Связанные ссылки: <issue / epic / pr / doc>, ADR-0001

## Контекст

Необходимо реализовать отдельный микросервис `auth-service`, отвечающий за регистрацию, логин, выдачу и обновление
сессий пользователей. Сервис общается с BFF через RabbitMQ, имеет собственную БД (PostgreSQL) с отдельным пользователем
БД. Структура хранилища, контракты сообщений и flow аутентификации — в зоне ответственности этого ADR.

Требования:

- Регистрация и логин пользователя.
- Сессия одна на пользователя (одна на все устройства). Сессии per-устройство — отдельная фича на будущее.
- Refresh сессии должен происходить прозрачно для пользователя и не разлогинивать другие устройства.
- Безопасность должна быть выдержана настолько, насколько возможно при условии "одна сессия на все устройства".
- Браузер считается потенциально рискованным устройством — JS-доступ к токенам должен быть исключён.
- Refresh-логика должна минимизировать запросы к БД при обычной работе.

Ограничения и вводные:

- БД: PostgreSQL, query builder: Kysely.
- Транспорт между BFF и auth-service: RabbitMQ.
- Хеширование паролей: Node.js `crypto` (PBKDF2 или scrypt).
- Длина пароля: минимум 8 символов.
- Верификация email и восстановление пароля — отдельные фичи на будущее.
- `auth-service` — единственный источник правды по сессиям. BFF не хранит state сессий, только проверяет JWT.
- `auth-service` — управляет пользователями и сессиями, другие сервисы не знают о сессиях, им передаётся только `userId`.
- Мгновенная инвалидация сессий не требуется (logout, бан) — допустимо окно до истечения access JWT (15 минут).

## Решение

Используем JWT (access) + Refresh Token, оба в httpOnly cookie, с подписью RS256.

### Компоненты

**Access JWT:**

- Алгоритм подписи: RS256 (асимметричный).
- Payload: `{ uid, exp }`.
- TTL: 15 минут.
- Подписывается приватным ключом в `auth-service`.
- Проверяется публичным ключом в `BFF` (без обращения к auth-service).
- Хранится в httpOnly cookie с `Path=/`, `Secure`, `SameSite=lax`.

**Refresh Token:**

- Случайная строка с энтропией не менее 256 бит (`crypto.randomBytes(32)`).
- TTL: 30 дней (= `refreshableUntil` сессии).
- Без ротации — один refresh token живёт весь срок сессии.
- Хранится в httpOnly cookie с `Path=/refresh`, `Secure`, `SameSite=lax` — браузер не отправляет его на другие пути.
- На стороне `auth-service` в БД хранится хеш токена, не сам токен.

**Сессия:**

- Одна запись на пользователя.
- Концептуально "сессия = refresh token" — отдельной сущности `sessions` рядом с `sessions` нет.
- При повторном логине того же пользователя — старая сессия удаляется (один refresh token на пользователя).

### Flow

**Регистрация (`auth.signup.command`):**

1. Валидация (email уникален, пароль ≥ 8 символов).
2. Хеширование пароля.
3. Запись в `users`.
4. Создание refresh token, запись в `sessions` с хешем токена.
5. Выпуск access JWT.
6. Возврат BFF: `{ accessToken, refreshToken }`. BFF выставляет cookies клиенту.

**Логин (`auth.login.command`):**

1. Поиск пользователя по email.
2. Проверка пароля.
3. Удаление старого refresh token этого пользователя (если есть).
4. Создание нового refresh token, запись в `sessions`.
5. Выпуск access JWT.
6. Возврат BFF: `{ accessToken, refreshToken }`. BFF выставляет cookies клиенту.

**Получение текущего пользователя (`auth.me.query`):**

1. BFF извлекает `uid` из access JWT (после проверки подписи).
2. Запрашивает `auth.me.query` с `uid`.
3. Auth-service возвращает данные пользователя из `users`.

**Refresh (`auth.refresh.command`):**

1. Клиент идёт на BFF endpoint `POST /refresh`. Браузер автоматически шлёт refresh token (cookie с
   `Path=/refresh`).
2. BFF извлекает refresh token из cookie, отправляет в `auth.refresh.command`.
3. Auth-service:
    - Хеширует полученный refresh token, ищет в `sessions`.
    - Проверяет, что не истёк (`expires_at > now`).
    - Получает `uid` из записи.
    - Выпускает новый access JWT.
    - Возвращает `{ accessToken }` (refresh token не меняется).
4. BFF обновляет cookie с access JWT, отправляет ответ клиенту.

**Logout (`auth.logout.command`):**

1. Клиент идёт на BFF endpoint logout.
2. BFF вызывает `auth.logout.command` с refresh token из cookie.
3. Auth-service удаляет запись из `sessions`.
4. BFF очищает обе cookie на клиенте.

### Транспорты на BFF

- HTTP-запросы (Next.js сервер → BFF): access JWT отправляется в cookie на каждом запросе. BFF проверяет JWT публичным
  ключом локально, без сетевых вызовов.
- WebSocket (браузер → BFF): access JWT отправляется в cookie при handshake (cookie уходит автоматически с
  upgrade-запросом). BFF читает cookie из заголовков handshake, проверяет JWT, кладёт `uid` в контекст соединения. Все
  последующие операции через WS используют `uid` из контекста, токен повторно не передаётся.
- При истечении access JWT во время WS-сессии: BFF не делает re-validation внутри сессии (для упрощения). Соединение
  живёт до закрытия. Если access JWT истёк за время WS-сессии — `uid` в контексте уже невалиден формально, но операции
  продолжают работать. Это сознательный trade-off в пользу простоты и UX.
- При попытке HTTP-запроса с истёкшим access JWT: BFF возвращает 401, клиент идёт на `/refresh`, получает новый JWT,
  повторяет запрос.

### Ключи RS256

- Приватный ключ генерируется один раз, хранится в `auth-service` как secret (env / secret manager). Никогда не покидает
  сервис.
- Публичный ключ распространяется в BFF (env / config).

### Схема БД

Отдельная БД `auth_service` с отдельным пользователем БД `auth_service_service` с правами только на свои таблицы.

```sql
CREATE TABLE users (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text        NOT NULL UNIQUE,
  password_hash text       NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX users_email_idx ON users (email);

CREATE TABLE sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  text        NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_token_hash_idx ON sessions (token_hash);
```

`token_hash` — SHA-256 хеш refresh token'а. Сам токен в БД не хранится.

Из-за требования "одна сессия на пользователя" — на одного `user_id` максимум одна запись в `sessions` в любой
момент времени. Это поддерживается логикой логина (удаление старой записи при создании новой), а не constraint'ом —
constraint UNIQUE на `user_id` усложнил бы конкурентные сценарии.

### RMQ контракты

```
auth.signup.command
  Request:  { email: string, password: string }
  Response: { accessToken: string, refreshToken: string }

auth.login.command
  Request:  { email: string, password: string }
  Response: { accessToken: string, refreshToken: string }

auth.refresh.command
  Request:  { refreshToken: string }
  Response: { accessToken: string }

auth.logout.command
  Request:  { refreshToken: string }
  Response: { }

auth.me.query
  Request:  { uid: string }
  Response: { id: string, email: string }
```

## Причины выбора

- **JWT + Refresh минимизирует обращения к auth-service.** На каждый HTTP-запрос BFF проверяет access JWT публичным
  ключом локально, без RPC. Это критично при WS-handshake и для производительности.
- **RS256 даёт чёткое разделение ответственности:** только `auth-service` может выпускать токены, `BFF` — только
  проверять. Если `BFF` скомпрометирован, атакующий не получит возможности подписывать новые JWT.
- **HttpOnly cookie для обоих токенов** защищает от XSS-кражи. Refresh с `Path=/refresh` дополнительно ограничивает
  область видимости — браузер не шлёт его в другие endpoint'ы.
- **Без ротации refresh token** — клиент не должен обновлять refresh при каждом refresh, что упрощает синхронизацию
  состояния между несколькими вкладками и WS/HTTP транспортами.
- **Одна сессия на пользователя** упрощает таблицу `sessions` (нет нужды управлять списком устройств) и
  соответствует требованиям. Потенциал на расширение одна сессия === одно устройство
- **Stateless проверка JWT на BFF** — нет Redis, нет кеша сессий на стороне BFF.

## Альтернативы

### 1. SessionId в cookie + Redis (как в ADR-0001 для общей схемы BFF-сессий)

Почему не выбрали:

- Требует Redis на стороне BFF и стейт в `auth-service` для всех сессий.
- На каждом запросе — поход в Redis, на periodic recheck — поход в БД auth.
- Преимущество мгновенной инвалидации не востребовано в этом проекте: 15-минутное окно после logout приемлемо.
- Концепция "одна сессия на пользователя" хорошо ложится на refresh token, дополнительная сущность sessions излишня.

### 2. JWT + Refresh с ротацией refresh token

Почему не выбрали:

- Ротация ломает UX в сценарии нескольких вкладок и нескольких устройств: после refresh на устройстве А — устройство Б
  держит уже невалидный refresh.
- Требование "не разлогинивать другие устройства" исключает ротацию при условии одного refresh на пользователя.
- Без устройств per-сессия rotation не даёт значимого выигрыша в безопасности — атакующий с украденным refresh всё равно
  может получать access tokens до истечения.

### 3. HS256 вместо RS256

Почему не выбрали:

- Общий секрет в `auth-service` и `BFF` — `BFF` технически может выпускать JWT.
- При компрометации `BFF` атакующий получает возможность подписывать токены.
- Расширение на дополнительные сервисы (если в будущем JWT будет проверять не только `BFF`) потребует распространения
  секрета — точек утечки больше.
- Выигрыш в скорости HMAC vs RSA нерелевантен (микросекунды).

### 4. JWT в JS-доступной памяти + WS через `connectionParams`

Почему не выбрали:

- Хранение JWT в памяти JS делает его доступным для XSS.
- Противоречит требованию "браузер потенциально рискованное устройство, только закрытые от JS куки".
- Cookie на handshake работает не хуже и безопаснее.

### 5. Sliding session без refresh token

Почему не выбрали:

- Требует stateful BFF (Redis для продления TTL).
- Не даёт преимуществ в архитектуре, где основная авторизация stateless.

## Последствия

### Плюсы

- Stateless проверка access JWT на BFF — нулевая нагрузка на сеть/БД при обычных запросах.
- Чёткое разделение ответственности: `auth-service` единственный, кто может выпускать токены (RS256).
- Простая модель: одна сессия = один refresh token.
- Прозрачный для UI refresh: клиент не знает про refresh, всё на сервере.
- Одинаковая работа для HTTP и WS — cookie уходит автоматически в обоих случаях.
- Минимум stateful компонентов: только запись в `sessions` для каждой активной сессии.

### Минусы

- 15-минутное окно после logout/бана, в течение которого старый access JWT остаётся валидным.
- Размер cookie с JWT — 500+ байт. Шлётся на каждый HTTP-запрос (но HTTP-запросы в основном с Next.js сервера, не из
  браузера).
- Refresh token живёт 30 дней без ротации — окно атаки на украденный refresh token равно его TTL.
- JWT payload видим в base64 на клиенте (доступ только серверу через cookie, но в момент HTTP-ответа payload теоретически
  видно). Поэтому в payload только `uid`, никаких чувствительных данных.

### Риски

- **Кража refresh token (XSS-обход httpOnly, утечка с устройства).**
    - Митигация: `httpOnly`, `Secure`, `SameSite=lax`, `Path=/refresh`. CSP. Регулярный аудит.
    - Принимаем: при успешной краже — атакующий имеет доступ до истечения refresh token (30 дней) или до явного logout.

- **Кража access JWT.**
    - Митигация: короткий TTL (15 минут), `httpOnly`.
    - Принимаем: окно атаки до 15 минут.

- **Утечка приватного RSA-ключа.**
    - Митигация: secret manager, шифрование at rest, ограничение доступа. Ключ только в `auth-service`.
    - План на будущее: JWKS endpoint + ротация ключей.

- **Гонки при login (одновременный логин с двух устройств).**
    - Сценарий: устройство A и B одновременно логинятся → оба получают новый refresh token, но в БД остаётся последний.
      Первый устройство получит 401 при следующем refresh.
    - Митигация: транзакционное удаление+создание в одной транзакции. Принимаем редкое срабатывание гонки.

- **Скомпрометированный `BFF`.**
    - Атакующий может проверять JWT, но не может выпускать новые (RS256). Может читать cookie из proxy-запросов.
    - Митигация: разделение сетей, аудит, секреты в secret manager.

- **CSRF на mutating-операциях.**
    - Митигация: `SameSite=lax` на cookie. Для критичных операций — отдельный CSRF-токен.

## План внедрения

- [ ] Создать БД `auth_service_db`, пользователя `auth_service_user`, выдать права только на свои таблицы.
- [ ] Применить миграции для `users` и `sessions`.
- [ ] Реализовать модуль `auth-service` на NestJS с RMQ-транспортом.
- [ ] Реализовать репозитории через Kysely для `users` и `sessions`.
- [ ] Реализовать хеширование паролей (PBKDF2 или scrypt) через `crypto`.
- [ ] Сгенерировать пару RSA-ключей, положить приватный в `auth-service`, публичный — в `BFF`.
- [ ] Реализовать выпуск/проверку JWT (RS256).
- [ ] Реализовать `auth.signup.command`, `auth.login.command`, `auth.refresh.command`, `auth.logout.command`,
  `auth.me.query`.
- [ ] Реализовать на BFF: HTTP endpoint `/refresh` (proxy к `auth.refresh.command`), endpoint logout, выставление и
  очистка cookies.
- [ ] Реализовать на BFF: AuthGuard на основе проверки access JWT (HTTP + WS).
- [ ] Покрыть тестами: signup, login, refresh, logout, повторный логин, истечение access JWT, истечение refresh token.
- [ ] Настроить мониторинг: количество выпущенных токенов, ошибки refresh, latency RMQ-вызовов.

## Критерии успеха

- BFF проверяет access JWT локально без сетевых вызовов (latency p99 < 1ms на проверку).
- Refresh не разлогинивает другие активные сессии того же пользователя.
- Истёкший access JWT приводит к 401 на HTTP, после чего клиент успешно рефрешится и повторяет запрос.
- Утечка только access JWT даёт атакующему окно ≤ 15 минут.
- Logout полностью удаляет refresh token из БД, повторный refresh с тем же токеном даёт 401.
- Повторный логин с того же или другого устройства корректно заменяет старый refresh token новым.