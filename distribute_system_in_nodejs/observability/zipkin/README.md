# 如何运行

## 启动顺序

- `docker run -p 9411:9411 \
     -it --name distnode-zipkin \
     openzipkin/zipkin-slim:2.19`
- `node consumer-http-zipkin.js`
- `node producer-http-zipkin.js`
