文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\AgentController::getInspectionIp

## 接口：匹配ip订单

接口地址：/admin/agent/inspectionip GET

匹配ip订单 -- wyh

  

**接口说明:匹配ip订单**

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

ip

整型

必填

1

\-

调取IP

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "orders":[{//订单信息         "id":"订单IDusername:客户companyname:公司名dedicatedip:ipassignedips:ipcreate_time:订购时间status_zh:状态，颜色",       }]     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

ip

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
