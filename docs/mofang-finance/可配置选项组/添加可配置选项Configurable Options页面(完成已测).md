文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\ConfigOptionsController::addOptions

## 接口：添加可配置选项Configurable Options页面(完成已测)

接口地址：/admin/options/add\_options POST

添加可配置选项Configurable Options页面(完成已测) -- wyh

  

**接口说明:添加可配置选项**

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

gid

整型

必填

1

\-

可选项配置组ID

option\_name

字符串

必填

1

\-

可选项配置名称

option\_type

tinyint

必填

1

\-

可选项配置类型：1默认Dropdown,2radio,3yes/no,4quantity

addoptionname

字符串

必填

1

\-

子项名称

addsortorder

tinyint

必填

1

\-

排序默认为0

addhidden

tinyint

必填

1

\-

1隐藏

notes

字符串

非必填

1

\-

备注

qty\_stage

字符串

非必填

1

\-

数量阶梯

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "cid":"可配置项ID（页面跳转至编辑页）",     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

gid

option\_name

option\_type

addoptionname

addsortorder

addhidden

notes

qty\_stage

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
