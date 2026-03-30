文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\ZjmfFinanceApiController::index

## 接口：魔方财务API列表

接口地址：/admin/zjmf\_finance\_api GET

魔方财务API列表 -- hh

  

**时间 2020-08-03**

  

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

排序(id,name,hostname,server\_num,api\_status)

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

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "list":[{//列表数据         "id":"ID",         "name":"名称",         "hostname":"接口地址",         "username":"用户名",         "password":"密码",         "status":"连接状态(0异常1正常)",         "product_num":"可售商品数量",         "set_product_num":"设置商品数量",         "active_host_num":"正常产品数量",         "host_num":"总产品数量",         "type_zh":"接口类型：zjmf_api智简魔方，manual手动",         "contact_way":"联系方式",         "autoreply_isopen":"自动回复开关",         "autoreply_account":"自动回复账号",       }]     }   }`

  

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

  
