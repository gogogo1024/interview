# 如何运行

## 启动顺序

   udp.conf文件位置填写你的全路径

- `docker run \
  -p 8080:80 \
  -p 8125:8125/udp \
  -it --name distnode-graphite graphiteapp/graphite-statsd:1.1.6-1`
- `docker run \
  -p 8000:3000 \
  -it --name distnode-grafana grafana/grafana:6.5.2`
- `NODE_DEBUG=statsd-client node consumer-http-metrics.js`
- `node producer-http-basic.js`
- 在kibana页面中配置索引nodejs-*,添加field @timestamp
