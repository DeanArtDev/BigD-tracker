# BigD Tracker

Монорепозиторий платформы трекера задач и тренировок.
Проект включает backend на NestJS (микросервисы), frontend-клиент на React/Vite и набор общих библиотек.

[Схема архитектуры сервисов (Figma)](https://www.figma.com/design/GOPxwov2ktqLWnTicS6wmg/Big-D-Tracker?node-id=3-705&t=8tLYwrhkpLHJ6aD2-1)

## Что в проекте

- `apps/auth-service` - сервис авторизации и сессий
- `apps/api-gateway` - единая HTTP-точка входа (gateway)
- `apps/goal-service` - домен целей, задач и inbox
- `apps/training-service` - домен тренировок, упражнений и повторений
- `clients/tracker-client` - web-клиент на React + Vite
- `libs/*` - общие библиотеки (контракты API, инфраструктурные утилиты, исключения, доступ к БД)
- `servers/dev-stage` - init-скрипты для локальной инфраструктуры
- `docker-compose.dev.yml` - локальные PostgreSQL и RabbitMQ
- `docker-compose.yml` - сборка и запуск всех приложений в контейнерах

## Технологический стек

- Node.js `^24.13`
- pnpm `10.10.0`
- Turborepo
- NestJS (микросервисы)
- React + Vite
- PostgreSQL + RabbitMQ
- Kysely (доступ к БД и миграции)

## Требования

Перед стартом должны быть установлены:

- Node.js `^24.13`
- pnpm `10.10.0`
- Docker и Docker Compose

## Быстрый старт (локальная разработка)

1. Установите зависимости:

```bash
pnpm install
```

2. Подготовьте окружение:

- заполните корневые файлы `.env` и `.env.development`
- создайте и заполните `.env` в приложениях на основе:
  - `apps/auth-service/.env.example`
  - `apps/api-gateway/.env.example`
  - `apps/goal-service/.env.example`
  - `apps/training-service/.env.example`
  - `clients/tracker-client/.env.example`

3. Поднимите инфраструктуру разработки (PostgreSQL + RabbitMQ):

```bash
pnpm service-infrastructure:dev:up
```

4. Примените миграции и (при необходимости) загрузите сиды:

```bash
pnpm migrate:all
pnpm seed:all
```

5. Запустите сервисы и клиент (обычно в отдельных терминалах):

```bash
pnpm auth-service:dev
pnpm training-service:dev
pnpm goal-service:dev
pnpm api-gateway:dev
pnpm tracker-client:dev
```

6. Остановите инфраструктуру после завершения работы:

```bash
pnpm service-infrastructure:dev:down
```

## Полезные команды

Проверка качества:

```bash
pnpm format:all
pnpm lint:all
pnpm test:all
```

Исправление форматирования и линтинга:

```bash
pnpm format:all:fix
pnpm lint:all:fix
```

Сборка:

```bash
pnpm build:services:all
pnpm build:clientes:all
```

## Docker-сценарий запуска всех приложений

Используется `docker-compose.yml` и корневой `.env`.

Запуск:

```bash
pnpm docker:build:test:up
```

Остановка:

```bash
pnpm docker:build:test:down
```

## Структура монорепозитория

```text
.
├── apps/                 # backend сервисы (NestJS)
├── clients/              # frontend клиенты
├── libs/                 # shared packages
├── configs/              # общие конфиги
├── servers/              # docker/init окружение
├── tools/                # служебные скрипты (deploy, миграции)
├── docker-compose.dev.yml
├── docker-compose.yml
└── turbo.json
```

## Дополнительно

- API gateway README: `apps/api-gateway/README.md`
- Training service README: `apps/training-service/README.md`
