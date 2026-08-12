# Архитектура frontend и BFF

Эта директория содержит Architecture as Code документацию для пользовательского контура BigD Tracker.

Source of truth:

- кодовая база в этом репозитории
- `clients/tracker-client`
- `apps/api-gateway`
- связанные backend-сервисы, с которыми BFF реально взаимодействует

## Что здесь лежит

```text
docs/architecture/
├── README.md
├── c4/
│   ├── workspace.dsl
│   ├── frontend-bff-context.dsl
│   └── frontend-bff-container.dsl
├── adr/
│   ├── 0001-use-bff.md
│   ├── 0002-nextjs-ssr-strategy.md
│   ├── 0003-use-c4-model.md
│   └── 0004-use-architecture-as-code.md
```

## Что моделируется

- `tracker-client` как SPA на `React + Vite`
- `api-gateway` как `BFF`
- backend-сервисы, которые реально вызываются из BFF:
  - `auth-service`
  - `goal-service`
  - `training-service`
- `RabbitMQ` как транспорт RPC-вызовов

## Как читать модель

Уровни C4:

- `System Context`: показывает пользователя, frontend/BFF контур и внешние backend-системы
- `Container`: показывает основные runtime-блоки пользовательского контура
- `Dynamic`: показывает реальный сценарий orchestration из кода

## Границы ответственности

Frontend (`tracker-client`):

- рендерит UI и маршруты
- управляет локальным состоянием и application cache через TanStack Query
- вызывает только BFF API
- не знает о внутреннем RPC-транспорте и топологии backend

BFF (`api-gateway`):

- публикует HTTP API под `/api`
- управляет auth, cookie, валидацией, Swagger и обработкой ошибок
- адаптирует HTTP-вызовы в RPC через RabbitMQ
- координирует backend-сервисы там, где это реально требуется

Backend-сервисы:

- реализуют доменную логику
- не адаптированы напрямую под frontend
- изолированы от клиента через BFF

## Кэширование

В репозитории подтверждены следующие уровни:

- `browser`: стандартный кэш браузера для статических ассетов и HTTP-ответов, если это позволит окружение доставки
- `application`: кэш запросов в `TanStack Query`, `staleTime = 5 минут`

В репозитории не обнаружен отдельный CDN или edge-cache слой как часть source of truth, поэтому он не моделируется как обязательный элемент C4.

## Потенциальные точки отказа

- недоступность `api-gateway` полностью блокирует frontend-интеграцию
- недоступность `RabbitMQ` блокирует BFF-вызовы к микросервисам
- недоступность `auth-service` ломает login, refresh, logout, `me`
- недоступность `goal-service` ломает planner-сценарии и часть onboarding
- недоступность `training-service` ломает gym-сценарии

## Waterfall и агрегация

В текущей кодовой базе:

- есть BFF orchestration между несколькими сервисами для регистрации пользователя
- нет отдельного явного page-load endpoint, который агрегирует несколько backend-сервисов в один payload для экрана
- часть page-load сценариев вероятнее всего собирается frontend-клиентом через несколько BFF endpoint’ов

Поэтому `dynamic` view основан на реальном orchestration-сценарии `register.sage.ts`, а не на придуманной агрегации для загрузки страницы.
