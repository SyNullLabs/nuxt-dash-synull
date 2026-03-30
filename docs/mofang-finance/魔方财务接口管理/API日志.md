文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\ZjmfFinanceApiController::apiLog

## 接口：API日志

接口地址：/admin/zjmf\_finance\_api/logs GET

API日志 -- wyh

  

**时间 2021-06-03**

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

uid

整型

非必填

1

\-

客户ID，单个客户日志需要传

page

整型

非必填

1

\-

页数

limit

整型

非必填

10

\-

每页条数

order

字符串

非必填

id

\-

排序(id,name,hostname,server\_num,api\_status)

sort

字符串

非必填

asc

\-

排序方向(asc,desc)

search\_time

整型

非必填

\-

\-

传入时间戳，返回当天日志

search\_desc

字符串

非必填

\-

\-

通过描述查询

search\_ip

字符串

非必填

\-

\-

ip地址查询

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "logs":[{//日志       }]     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

uid

page

limit

order

sort

search\_time

search\_desc

search\_ip

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
