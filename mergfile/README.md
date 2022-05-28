# 处理文件合并

## 文件数字表示文件大小

   更好的做法是用meta文件对象存储文件名以及对应的大小，当前是直接写入文件名中

## streamMerge递归写法，streamConcurrentMerge写法Promise.all并发处理

    对比下来streamMerge比streamMerge快3倍在当前测试小文件下
different