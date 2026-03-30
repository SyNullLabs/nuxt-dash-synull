文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\ZjmfFinanceApiController::createApi

## 接口：添加魔方财务API

接口地址：/admin/zjmf\_finance\_api POST

添加魔方财务API -- huanghao

  

**添加魔方财务API**

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

name

字符串

必填

\-

\-

名称

hostname

字符串

必填

\-

\-

地址(IP或者域名)

username

字符串

必填

\-

\-

用户名

password

字符串

必填

\-

\-

密码

des

字符串

必填

\-

\-

备注

type

字符串

必填

\-

\-

接口类型：zjmf\_api智简魔方，manual手动，v10

contact\_way

字符串

必填

\-

\-

联系方式

\-

字符串

非必填

\-

\-

自动回复开关

\-

字符串

非必填

\-

\-

自动回复账号

\-

tinyint

非必填

\-

\-

前台订购实时更新库存和商品,1开启默认,0关闭

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

name

hostname

username

password

des

type

contact\_way

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
