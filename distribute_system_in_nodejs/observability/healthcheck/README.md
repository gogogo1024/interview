# 如何运行

## 启动顺序

- `docker run \
  --rm \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=hunter2 \
  -e POSTGRES_USER=tmp \
  -e POSTGRES_DB=tmp \
  postgres:12.3`
- `docker run \
  --rm \
  -p 6379:6379 \
  redis:6.0`
- `PGUSER=tmp PGPASSWORD=hunter2 PGDATABASE=tmp \
     node basic-http-healthcheck.js`

