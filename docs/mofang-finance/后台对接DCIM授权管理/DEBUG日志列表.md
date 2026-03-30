文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\DcimAuthController::debugLogList

## 接口：DEBUG日志列表

接口地址：/admin/dcimauth/debugLog GET

DEBUG日志列表 -- xujin

  

**DEBUG日志列表**

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

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

orderby

字符串

非必填

id

\-

排序(id,description,create\_date)

sort

字符串

非必填

asc

\-

排序方向(asc,desc)

search

字符串

非必填

\-

\-

搜索

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "list":[{//列表数据         "id":"DEBUG日志ID",         "admin":"操作人",         "date":"操作时间",         "ip":"操作IP",         "description":"结果详情",         "create_date":"添加时间",       }]     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

page

limit

orderby

sort

search

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
