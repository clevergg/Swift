-- Init-скрипт PostgreSQL.
-- Выполняется ОДИН раз — при первом создании volume postgres_data.
-- Если база уже создана, повторно не запускается (нужен docker compose down -v).
--
-- Здесь подключаем расширения, которые понадобятся приложению.

-- uuid-ossp: генерация UUID на стороне БД.
-- Prisma умеет генерировать id сама, но extension полезен для прямых SQL-запросов
-- и значений по умолчанию на уровне базы.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_trgm: триграммные индексы для быстрого поиска по тексту (ILIKE, похожие строки).
-- Понадобится для поиска по карточкам, доскам, участникам.
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- citext: регистронезависимый текст. Удобно для email — чтобы User@mail.com
-- и user@mail.com считались одинаковыми без ручного приведения к нижнему регистру.
CREATE EXTENSION IF NOT EXISTS "citext";
