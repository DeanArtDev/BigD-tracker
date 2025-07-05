-- 1. Создаём роль-пользователя
CREATE ROLE account_service_user
    LOGIN PASSWORD 'account_service_dev_pass';

-- 2. Разрешаем подключаться к базе (если нужно)
GRANT CONNECT ON DATABASE devdb TO account_service_user;

-- 3. Давем право использовать схему, где лежат таблицы
GRANT USAGE ON SCHEMA public TO account_service_user;

-- 4. Предоставляем права на конкретные таблицы
GRANT SELECT, INSERT, UPDATE, DELETE
      ON TABLE public.users, public.sessions
          TO account_service_user;

