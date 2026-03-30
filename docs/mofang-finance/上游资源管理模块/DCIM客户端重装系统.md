文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\UpperReachesController::dcimClientReinstall

## 接口：DCIM客户端重装系统

接口地址：/admin/upper/dcim\_client/reinstall post

DCIM客户端重装系统 -- xj

  

**接口说明:DCIM客户端重装系统**

  

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

资源id

os

整型

必填

\-

\-

操作系统ID

password

字符串

必填

\-

\-

密码(六位以上且由大小写字母数字三种组成)

port

整型

必填

\-

\-

端口号

part\_type

整型

非必填

0

\-

分区类型(windows才有0全盘格式化1第一分区格式化)

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

id

os

password

port

part\_type

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
