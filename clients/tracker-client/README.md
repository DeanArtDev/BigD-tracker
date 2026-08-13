# Tracker Client

Frontend-приложение платформы BigD Tracker.
Клиент отвечает за пользовательский интерфейс для двух основных доменов:

- Planner (группы, задачи, inbox, diary)
- Gym (тренировки, шаблоны, упражнения, активная тренировка)

## Ключевая информация

- Стек: React 19, TypeScript, Vite 7, React Router 7, TanStack Query, Tailwind CSS 4.
- Точка входа: `src/app/main.tsx`.
- Основной роутер: `src/app/router.tsx`.
- Базовый URL API берется из `VITE_API_BASE_URL`.
- Клиент ожидает доступный `api-gateway` (по умолчанию `http://localhost:4002`).

## Требования

- Node.js `^24.13`
- pnpm `11.21.0`

## Переменные окружения

Шаблон: `clients/tracker-client/.env.example`

```env
VITE_API_BASE_URL=/api
VITE_CLIENT_PORT=3033
```

Описание:

- `VITE_API_BASE_URL` - базовый URL backend API (например `/api` за reverse proxy или `http://localhost:4002/api`).
- `VITE_CLIENT_PORT` - порт локального dev/preview сервера Vite.

## Локальный запуск

Из корня монорепозитория:

```bash
pnpm install
pnpm tracker-client:dev
```

Запуск из директории клиента:

```bash
cd clients/tracker-client
pnpm dev
```

После запуска приложение доступно на `http://localhost:<VITE_CLIENT_PORT>`.

## Генерация API-типов (OpenAPI)

Клиент может генерировать типы из Swagger API Gateway:

```bash
pnpm api:generate
```

Команда читает схему с `http://localhost:4002/swagger/json` и обновляет файл:
`src/shared/api/types/generated-types.ts`

Перед запуском убедитесь, что `api-gateway` поднят локально.

## Основные команды

```bash
pnpm dev
pnpm build
pnpm preview
pnpm type:check
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:fix
pnpm dead:code:analyse
pnpm dead:deps:analyse
```

## Архитектура каталогов

```text
src/
├── app/        # bootstrap, providers, router, global boundaries
├── page/       # page-level модули (Planner, Gym и др.)
├── feature/    # пользовательские сценарии и фичи
├── entity/     # доменные сущности, адаптеры, state/model
└── shared/     # API слой, UI-kit, utils, инфраструктурные модули
```

## Production и Docker

Сборка клиента:

```bash
pnpm build
```

Docker-образ собирается через `clients/tracker-client/Dockerfile`:

- Stage builder собирает монорепо-часть через Turborepo.
- Финальный stage использует `nginx:alpine` и отдает статику из `dist`.
- Порт контейнера: `80`.

## Возможные проблемы

- `api:generate` не работает: проверьте, что `api-gateway` запущен и доступен по `http://localhost:4002/swagger/json`.
- Ошибки CORS/авторизации в dev: проверьте `VITE_API_BASE_URL` и настройки `ORIGIN` в `api-gateway`.
- Порт занят: измените `VITE_CLIENT_PORT` в `.env`.
