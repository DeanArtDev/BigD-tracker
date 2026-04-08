workspace "BigD Tracker - Frontend/BFF Container" "Standalone Container view for quick rendering in Structurizr-compatible tools." {
    model {
        user = person "Пользователь" "Работает с Planner и Gym через web-интерфейс."

        bigd = softwareSystem "BigD Tracker" "Пользовательский контур платформы задач и тренировок." {
            tracker_client = container "tracker-client" "SPA-клиент для Planner и Gym." "React 19, TypeScript, Vite 7, TanStack Query"
            api_gateway = container "api-gateway (BFF)" "HTTP BFF для frontend." "NestJS 11, Swagger, cookie-parser"
        }

        rabbitmq = softwareSystem "RabbitMQ" "Брокер сообщений для RPC между BFF и backend-сервисами."
        account_service = softwareSystem "account-service" "Сервис аккаунтов и сессий."
        goal_service = softwareSystem "goal-service" "Planner-домен."
        training_service = softwareSystem "training-service" "Gym-домен."

        user -> tracker_client "Использует интерфейс" "HTTPS"
        tracker_client -> api_gateway "Вызывает BFF" "HTTP/JSON"
        api_gateway -> rabbitmq "Отправляет RPC-запросы" "AMQP"
        api_gateway -> account_service "Auth и профиль" "RPC over RabbitMQ"
        api_gateway -> goal_service "Planner use cases" "RPC over RabbitMQ"
        api_gateway -> training_service "Gym use cases" "RPC over RabbitMQ"
    }

    views {
        container bigd "frontend-bff-container" {
            include user
            include tracker_client
            include api_gateway
            include rabbitmq
            include account_service
            include goal_service
            include training_service

            autolayout lr
            title "BigD Tracker - Frontend/BFF Container"
        }

        styles {
            element "Element" {
                color "#111827"
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
            }
        }
    }
}