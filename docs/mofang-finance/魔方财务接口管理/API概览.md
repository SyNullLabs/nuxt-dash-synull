文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\ZjmfFinanceApiController::downstreamSummary

## 接口：API概览

接口地址：/admin/zjmf\_finance\_api/downstream\_summary GET

API概览 -- wyh

  

**时间 2021-05-27**

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

id

整型

必填

\-

\-

API

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "client":[{//基础数据         "api_password":"api密钥api_create_time:开通时间agent_count:代理商品数量host_count:API产品数量",         "active_count":"API产品数量",         "api_count":"昨日api请求次数ratio:日环比up:1上升，0下降",       }]       "form_api":"最近7天每天的api请求次数",       "free_products":[{//豁免产品         "id":"name:名称ontrial:试用数量qty:最大购买数量",       }]     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

id

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
