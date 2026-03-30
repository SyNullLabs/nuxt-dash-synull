文档地址：http://w2.test.idcsmart.com/doc?name=app\\home\\controller\\DeveloperController::getBug

## 接口：BUG

接口地址：/developer/bug get

BUG -- xj

  

**接口说明:BUG**

  

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

1

\-

页数

limit

整型

非必填

10

\-

每页条数

orderby

字符串

非必填

create\_time

\-

排序(create\_time,score)

classify

字符串

非必填

\-

\-

类型(finance,cloud,dcim,other)

status

字符串

非必填

\-

\-

状态

keywords

字符串

非必填

\-

\-

关键字

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "count":"总数",       "status":"状态",       "classify":"分类",       "bug":[{//BUG列表         "id":"BUG",         "IDuid":"用户IDstatus_zh:状态classify_zh:分类is_bug:是BUGnot_bug:不是BUGtitle:标题username:用户名encounter_num:我也遇到数量views:浏览量is_encounter:我也遇到0未标记1已标记create_time:创建时间",       }]     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

page

limit

orderby

classify

status

keywords

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
