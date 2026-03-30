文档地址：http://w2.test.idcsmart.com/doc?name=app\\home\\controller\\VoucherController::getIssueVoucher

## 接口：开具发票页面 id: title:抬头 issue\_type:开具类型

接口地址：voucher/issuevoucher GET

开具发票页面 id: title:抬头 issue\_type:开具类型 -- wyh

  

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

invoice\_ids

数组

必填

\-

\-

数组

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "type":"开具类型：person个人,company公司",       "express":[{//快递信息         "name":"快递名称",         "price":"快递价格",       }]       "post":[{//邮寄地址         "id":"地址ID",         "province":"邮寄地址",         "city":"邮寄地址",         "region":"邮寄地址",         "default":"默认1地址,0否",       }]       "title":[{//抬头信息         "id":"",         "title":"抬头",         "issue_type":"开具类型",       }]       "invoices":[{//账单信息         "description":"产品名称",         "subtotal":"金额",         "taxed":"税率",         "taxed_amount":"税额",       }]       "voucher_amount":"开发票扣税",     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

invoice\_ids

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
