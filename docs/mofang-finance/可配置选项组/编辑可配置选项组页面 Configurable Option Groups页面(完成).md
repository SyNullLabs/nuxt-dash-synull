文档地址：http://w2.test.idcsmart.com/doc?name=app\\admin\\controller\\ConfigOptionsController::editGroups

## 接口：编辑可配置选项组页面 Configurable Option Groups页面(完成)

接口地址：/admin/options/edit\_groups/:gid GET

编辑可配置选项组页面 Configurable Option Groups页面(完成) -- wyh

  

**接口说明:编辑可配置选项组页面**

  

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

字符串

必填

1

\-

可选项配置组ID

type

number

必填

\-

\-

产品组分类1=通用2=裸金属3=魔方云

  

### 返回结果

`{     "status":200/201/203/204/400/401/406,     "msg":提示信息,     "data":{       ".group":"可选项配置组信息",       ".group.name":"可选项配置组名称",       ".group.description":"可选项配置组描述",       ".group.global":"是否全局配置项组：1是、0否",       ".pids":"已经选择的产品组--产品ID",       ".product":"产品信息",       ".product.pg_name":"产品组名称",       ".product.p_name":"产品名称",       ".product.p_id":"产品ID",       ".product.link":"展示方式",       ".options":"可选项配置信息",       ".options.option_name":"可选项配置名称",       ".options.option_type":"可选项配置类型,1默认Dropdown,2radio,3yes/no,4quantity",       ".options.order":"可选项配置排序默认0",       ".options.hidden":"可选项配置是否显示：0默认显示，1隐藏",       ".options.upgrade":"可选项配置是否可以升降级：1是，0否",       ".options.is_discount":"可选项配置是否可以用于折扣：1是，0否",       "edition":"0免费版，1专业版",     }   }`

  

### 接口参数

接口地址

发送测试

提交方式

GET POST PUT DELETE

Cookie

   

增加参数

gid

type

### 返回结果

自定义解析数据 缩进量: 1 2 3 4 5 6  引号 [全选](javascript:void(0);) [展开](javascript:void(0);) [叠起](javascript:void(0);) [2级](javascript:void(0);) [3级](javascript:void(0);) [4级](javascript:void(0);) [5级](javascript:void(0);) [6级](javascript:void(0);) [7级](javascript:void(0);) [8级](javascript:void(0);)

  
