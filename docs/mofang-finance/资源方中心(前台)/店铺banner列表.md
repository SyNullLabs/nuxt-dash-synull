文档地址：http://w2.test.idcsmart.com/doc?name=app\\res\\controller\\ResourceHomeController::getResourceShopBannerLists

## 接口：店铺banner列表

接口地址：/resource/resourceshopbannerlists(admin/addons?\_plugin=idcsmart\_res\_supplier&\_controller=AdminIndex&\_action=getResourceShopBannerLists) GET

店铺banner列表 -- wyh

  

**接口说明:店铺banner列表**

  

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

必填

1

\-

第几页

limit

整型

必填

10

\-

每页多少条

order

字符串

必填

10

\-

排序字段

sort

整型

必填

10

\-

ASC,DESC

keywords

字符串

非必填

1

\-

按关键字搜索

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       "shop":[{//店铺信息         "name":"店铺名称",         "img":"标志",         "banner_open":"是否开启banner",       }]     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

page

limit

order

sort

keywords

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
