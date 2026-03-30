文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\SaleController::saleStatistics

## 接口：销售管理统计页 测试id默认传3

接口地址：/admin/sale/sale\_statistics GET

销售管理统计页 测试id默认传3 -- 请设置auhtor注释

  

**接口说明:销售管理统计页**

  

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

非必填

1

\-

销售id

start\_time

整型

非必填

\-

\-

时间

time

整型

非必填

\-

\-

时间类型

type

整型

非必填

1

\-

类型1顶部

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "today":[{//今日订单和业绩         "ordercount":"订单数",         "total":"业绩",       }]       "week":"这周订单和业绩",       "month":"这月订单和业绩",       "last_month":"上月订单和业绩",       "ladder":[{//当前阶梯         "turnover":"当前（没有就默认）last:下一级",       }]       "array":[{//图表       }]     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

id

start\_time

time

type

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
