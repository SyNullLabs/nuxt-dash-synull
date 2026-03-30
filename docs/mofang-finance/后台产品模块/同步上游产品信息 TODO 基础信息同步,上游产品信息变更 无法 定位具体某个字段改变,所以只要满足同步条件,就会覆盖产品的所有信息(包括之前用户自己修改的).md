文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\ProductController::syncProductInfo

## 接口：同步上游产品信息 TODO 基础信息同步,上游产品信息变更 无法 定位具体某个字段改变,所以只要满足同步条件,就会覆盖产品的所有信息(包括之前用户自己修改的)

接口地址：/admin/product/sync\_product\_info POST

同步上游产品信息 TODO 基础信息同步,上游产品信息变更 无法 定位具体某个字段改变,所以只要满足同步条件,就会覆盖产品的所有信息(包括之前用户自己修改的) -- wyh

  

**接口说明:同步上游产品信息**

  

-   [接口信息](#info)
-   [在线测试](#test)

### 接口参数

参数名字

类型

是否必须

默认值

其他

说明

pid

整型

必填

\-

\-

产品ID

upstream\_pid

整型

必填

\-

\-

上游产品ID

zjmf\_finance\_api\_id

整型

必填

\-

\-

魔方财务api

api\_type

整型

必填

\-

\-

接口类型::zjmf\_api(魔方财务api),manual(手动)，normal(通用),resource(资源池)

rate

浮点型

非必填

\-

\-

汇率

upstream\_price\_type

浮点型

非必填

\-

\-

价格方案

upstream\_price\_value

浮点型

非必填

\-

\-

百分比

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

pid

upstream\_pid

zjmf\_finance\_api\_id

api\_type

rate

upstream\_price\_type

upstream\_price\_value

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
