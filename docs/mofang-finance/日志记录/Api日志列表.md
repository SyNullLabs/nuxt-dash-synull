文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\LogRecordController::getApiLog

## 接口：Api日志列表

接口地址：/admin/log\_record/api\_log GET

Api日志列表 -- 请设置auhtor注释

  

**接口说明: Api日志列表**

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

keywords

字符串

非必填

\-

\-

搜索关键字

time

字符串

非必填

\-

\-

按时间搜索

uid

字符串

非必填

\-

\-

按用户搜索,公共接口调列表,与产品内页客户列表那里调用相同

page

整型

非必填

1

\-

页码

limit

整型

非必填

1

\-

每页条数

orderby

字符串

非必填

id

\-

排序字段

sorting

字符串

非必填

asc

\-

desc/asc，顺序或倒叙

uid

整型

非必填

\-

\-

uid

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

keywords

time

uid

page

limit

orderby

sorting

uid

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
