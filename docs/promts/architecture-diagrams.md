Ты — senior software architect и staff-level frontend/platform инженер.

Твоя задача — создать Architecture as Code (AaaC) документацию для проекта, используя C4 модель как основу.

Цель:
- Сгенерировать архитектуру как код (не картинки), пригодную для хранения в репозитории
- Обеспечить визуализацию связей между frontend, BFF и backend сервисами
- Сделать архитектуру "живой документацией", которую можно обновлять через код
- Сделать структуру удобной для дальнейшей работы AI-агентов

Основные требования:

1. Используй C4 модель как baseline:
    - System Context
    - Container
    - (опционально) Component
    - Dynamic diagram (обязательно хотя бы один сценарий)

2. Используй подход Architecture as Code:
    - Основной формат: Structurizr DSL
    - Никаких draw.io / картинок как source of truth

3. Отрази ключевые инженерные аспекты:
    - data flow (client → BFF → services)
    - агрегация данных в BFF
    - кэширование (browser / CDN / application)
    - возможные точки отказа (high-level)
    - взаимодействие между компонентами

Что нужно сгенерировать:
1. 📁 Структуру папок в репозитории:
   например:
   /docs/architecture/
   /c4/
   /diagrams/

2. 🧠 Основной файл Structurizr DSL (workspace.dsl), содержащий:
    - model
    - system context view
    - container view
    - dynamic view (реальный сценарий)

3. 📝 Markdown документацию:
    - описание архитектуры
    - как читать диаграммы
    - как обновлять модель
    - соглашения (naming, уровни C4)

Фокус:
- практичность
- читаемость
- пригодность для поддержки
- соответствие уровню senior frontend system design