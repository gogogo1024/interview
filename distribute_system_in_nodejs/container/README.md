# tips

## 容易变动的层放在dockerfile的尾部，能够让之前的层重用

## 选用精简的操作系统镜像，比如Ubuntu Linux发行版就比Debian繁琐,Alpine就是一个精简的linux镜像

## `docker build -t snoy/recipe-api:v0.0.1 .`

## `docker run --rm --name recipe-api-1 -p 8000:1337 snoy/recipe-api:v0.0.1`

## `curl http://127.0.0.1:8000/recipes/42`

## 自建镜像仓库，存储配置成s3或者兼容s3的minio（分布式部署），这样能保证上传和下载镜像的速度
