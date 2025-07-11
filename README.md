# BigD Tracker

[Architecture services schema](https://www.figma.com/design/GOPxwov2ktqLWnTicS6wmg/Big-D-Tracker?node-id=3-705&t=8tLYwrhkpLHJ6aD2-1)

## Содержание репозитория

- **apps** – NestJS микросервисы:
  - `account-service`
  - `api-gateway`
  - `goal-service`
  - `training-service`
- **clients** – фронтенд приложения (`tracker-client` на Vite)
- **libs** – общие библиотеки (`api-contracts`, `api-exceptions`, `api-utils`, `database`)
- **configs** – общие конфигурации (линер, tsconfig)
- **scripts** – shell‑скрипты для работы с инфраструктурой и БД

## Запуск в режиме разработки

1. Установите зависимости:
   ```bash
   pnpm install
   ```
2. Создайте файлы `.env` и `.env.development` на основе `*.env.example` в сервисах и клиенте.
3. Поднимите инфраструктуру (PostgreSQL, RabbitMQ):
   ```bash
   pnpm service-infrastucture:dev:up
   ```
4. Запустите нужные сервисы и клиент в dev‑режиме:
   ```bash
   pnpm account-service:dev
   pnpm training-service:dev
   pnpm goal-service:dev
   pnpm api-gateway:dev
   pnpm tracker-client:dev
   ```
5. По окончании работы инфраструктуру можно остановить:
   ```bash
   pnpm service-infrastucture:dev:down
   ```

## Запуск в production

1. Соберите приложения и образа Docker:
   ```bash
   pnpm build:all
   ```
2. Запустите все сервисы через `docker-compose.prod.yml`:
   ```bash
   pnpm compose:prod:up
   ```
3. Для остановки используйте:
   ```bash
   pnpm compose:prod:down
   ```
