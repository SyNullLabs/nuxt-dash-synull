文档地址：http://w2.test.idcsmart.com/doc?name=app\\home\\controller\\PayController::rechargePage

## 接口：请设置title注释

接口地址：/recharge\_page get

请设置title注释 -- wyh

  

**接口说明:充值中心页面**

  

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

\-

\-

页码

size

整型

非必填

\-

\-

长度

order

字符串

非必填

\-

\-

排序字段(trans\_id,amount\_in,pay\_time,type,gateway)

sort

字符串

非必填

\-

\-

排序规则(asc/desc)

keywords

字符串

非必填

\-

\-

关键字搜索(trans\_id,amount\_in)

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "trans_id":"流水单号",       "amount_in":"金额",       "pay_time":"交易日期",       "type":"来源",       "gateway":"支付方式",     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

page

size

order

sort

keywords

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
