workspace "BigD Tracker - Frontend and BFF" "C4 model for tracker-client and api-gateway based on the repository as the source of truth." {
    model {
        user = person "Пользователь" "Работает с Planner и Gym через web-интерфейс."

        bigd = softwareSystem "BigD Tracker" "Пользовательский контур платформы задач и тренировок." {
            tracker_client = container "tracker-client" "SPA-клиент для Planner и Gym. Источник истины: clients/tracker-client." "React 19, TypeScript, Vite 7, React Router 7, TanStack Query"
            api_gateway = container "api-gateway (BFF)" "HTTP BFF для frontend. Публикует /api, выполняет auth и orchestration backend-вызовов. Источник истины: apps/api-gateway." "NestJS 11, Express adapter, Swagger, cookie-parser"
        }

        rabbitmq = softwareSystem "RabbitMQ" "Брокер сообщений для RPC между BFF и backend-сервисами."
        account_service = softwareSystem "account-service" "Сервис аккаунтов, сессий, refresh token и профиля пользователя."
        goal_service = softwareSystem "goal-service" "Planner-домен: inbox, groups, tasks, diary."
        training_service = softwareSystem "training-service" "Gym-домен: trainings, templates, exercises, repetitions."

        user -> tracker_client "Использует интерфейс" "HTTPS"
        tracker_client -> api_gateway "Вызывает frontend-oriented API" "HTTP/JSON"

        api_gateway -> rabbitmq "Отправляет RPC-запросы" "AMQP"
        api_gateway -> account_service "Auth, sessions, me, referral token" "RPC over RabbitMQ"
        api_gateway -> goal_service "Planner use cases" "RPC over RabbitMQ"
        api_gateway -> training_service "Gym use cases" "RPC over RabbitMQ"
    }

    views {
        systemContext bigd "frontend-bff-system-context" {
            include user
            include bigd
            include rabbitmq
            include account_service
            include goal_service
            include training_service

            autolayout lr
            title "BigD Tracker - System Context"
            description "Пользовательский контур: frontend, BFF и backend-сервисы, с которыми реально работает BFF."
        }

        container bigd "frontend-bff-container" {
            include user
            include tracker_client
            include api_gateway
            include rabbitmq
            include account_service
            include goal_service
            include training_service

            autolayout lr
            title "BigD Tracker - Container View"
            description "Контейнерный уровень для tracker-client, api-gateway и backend-сервисов."
        }

        dynamic bigd "frontend-bff-registration-saga" {
            title "Регистрация пользователя через BFF orchestration"
            description "Реальный multi-service сценарий из apps/api-gateway/src/modules/auth/application/sages/register.sage.ts"

            user -> tracker_client "1. Открывает регистрацию и отправляет login/password"
            tracker_client -> api_gateway "2. POST /api/auth/register"
            api_gateway -> account_service "3. AccountRegister: создать пользователя, access token и refresh token"
            account_service -> api_gateway "4. Возвращает access token, refresh token и maxAge"
            api_gateway -> goal_service "5. GoalCreateInboxGroup: создать inbox для нового пользователя"
            goal_service -> api_gateway "6. Подтверждает создание inbox"
            api_gateway -> tracker_client "7. Возвращает access token и устанавливает refresh token cookie"

            autolayout lr
        }

        styles {
            element "Element" {
                color "#111827"
                fontSize 24
            }

            element "Person" {
                background "#0f766e"
                color "#ffffff"
                shape Person
            }

            element "Software System" {
                background "#dbeafe"
                color "#111827"
            }

            element "Container" {
                background "#ffffff"
                color "#111827"
                stroke "#94a3b8"
                strokeWidth 2
            }

            relationship "Relationship" {
                color "#475569"
                fontSize 20
                routing Orthogonal
            }
        }
    }
}
