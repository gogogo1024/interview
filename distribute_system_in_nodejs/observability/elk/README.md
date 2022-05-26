# 如何运行

## 启动顺序

   udp.conf文件位置填写你的全路径

- `docker run -p 5601:5601 -p 9200:9200 \
   -p 5044:5044 -p 7777:7777/udp \
   -v $PWD/udp.conf:/etc/logstash/conf.d/99-input-udp.conf \
   -e MAX_MAP_COUNT=262144 \
   -it --name distnode-elk sebp/elk:683`
- `NODE_ENV=development LOGSTASH=127.0.0.1:7777 \
  node consumer-http-logs.js`
- `node producer-http-basic.js`
- 在kibana页面中配置索引nodejs-*,添加field @timestamp
