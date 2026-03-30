文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\SetController::backupDatabaseFtp

## 接口：测试/保存ftp连接

接口地址：/admin/backup\_ftp post

测试/保存ftp连接 -- 萧十一郎

  

**接口说明:测试/保存ftp连接**

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

ftp\_backup\_hostname

字符串

必填

\-

\-

FTP主机

ftp\_backup\_port

number

必填

\-

\-

端口号

ftp\_backup\_username

字符串

必填

\-

\-

用户名

ftp\_backup\_password

字符串

必填

\-

\-

密码

ftp\_backup\_destination

字符串

必填

\-

\-

远程FTP备份路径

ftp\_secure\_mode

整型

非必填

\-

\-

SFTP模式1,0（与ftp\_passive\_mode

ftp\_passive\_mode

整型

非必填

\-

\-

FTP被动模式

type

字符串

必填

\-

\-

类型(test:测试链接，save:保存)

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

ftp\_backup\_hostname

ftp\_backup\_port

ftp\_backup\_username

ftp\_backup\_password

ftp\_backup\_destination

ftp\_secure\_mode

ftp\_passive\_mode

type

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
