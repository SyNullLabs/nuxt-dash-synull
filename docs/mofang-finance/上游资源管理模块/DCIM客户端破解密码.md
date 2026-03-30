文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\UpperReachesController::dcimClientCrackPass

## 接口：DCIM客户端破解密码

接口地址：/admin/upper/dcim\_client/crack\_pass post

DCIM客户端破解密码 -- xj

  

**接口说明:DCIM客户端破解密码**

  

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

password

字符串

必填

\-

\-

密码(六位以上且由大小写字母数字三种组成)

other\_user

整型

必填

\-

\-

是否破解其他用户(0:否1:是)

user

字符串

非必填

\-

\-

要破解的其他用户名称

  

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

password

other\_user

user

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
