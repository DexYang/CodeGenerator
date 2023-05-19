<h2 align='center'>
Template-based Code Generator By Pure Frontend
</h2>
<h3 align='center'>
基于模板的纯前端实现的代码生成器
</h3>

<h6 align='center'>
<a href="https://dexy-code-generator.netlify.app/">Live Demo</a>
</h6>

<h5 align='center'>
<b>Started from <a href="https://github.com/antfu/vitesse-lite">Vitesse-lite</a></b>
</h5>

<br>

<!-- <p align='center'> -->
<!-- <b>English</b> | <a href="https://github.com/antfu/vitesse-lite/blob/main/README.zh-CN.md">简体中文</a> -->
<!-- </p> -->

<br>

## Features

- ☁️ 纯前端实现，无后端, Deploy on Netlify with zero-netlify-config

- ☁️ 可以引入外部模板配置，并分享给他人

- ⚡️ [Vue 3](https://github.com/vuejs/core), [Vite 3](https://github.com/vitejs/vite), [pnpm](https://pnpm.io/), [ESBuild](https://github.com/evanw/esbuild), [UnoCSS](https://github.com/antfu/unocss) - inherit from vitesse-lite

- 🗂 [EJS Template Engine](https://ejs.co/), [NaiveUI](https://www.naiveui.com/), [Axios](), [Pinia](), [CodeMirror](), [JsZip](), [FileSaver]()

- 🦾 TypeScript, of course

<br>

## Share

<br>

除了可以读取自身的public目录下的模板配置外，还可以引入外部模板配置。

引入外部配置的两种方式是：

1 - 在模板选择时点击右上角的Netlify按钮，输入外部配置源

2 - 添加url参数：url=外部配置源

例如：https://dexy-code-generator.netlify.app/?url=https://dexy-mp-template.netlify.app

这使得你仅需在类似Netlify的服务上搭建一个自己的配置源，然后使用我的[Demo地址](https://dexy-code-generator.netlify.app/)添加上url参数就可以使用，并分享给你的团队！

外部静态配置可以参考[这里](https://github.com/DexYang/Code-Generator-Static-Templates), 可以在Netlify上一键部署，唯一一个特殊的配置即允许跨域调用

```
[[headers]]
  # Define which paths this specific [[headers]] block will cover.
  for = "/*"
    [headers.values]
    Access-Control-Allow-Origin = "*"
```


## Template Config

<br>

<p>
除了ejs模板之外，共有两个json格式的配置文件
 </p>

<br>

### 1 - 根目录下的config.json
```
{
  "templates": [
    {
      "config": "open_templates/db/config.json",
      "description": "DDL的简单模板",
      "icon": "mdi:database"
    }
  ]
}
```

该配置文件用于声明这一份配置共包含几套模板

所有模板都要声明在`templates`数组中

每项需要声明该模板的配置文件路径`config`、模板描述`description`和图标`icon`（[图标来源](https://iconify.design/)）
```
interface Config {
    templates: {
        config: string
        description: string
        icon: string
    }
}
```

该配置文件必须放在资源的根目录，且必须命名为`config.json`

<br>

### 2- 模板的json配置文件

例子
```
{
  "fileStructure": {
    "sql": {
      "mysql": {},
      "postgresql": {}
    }
  },
  "templates": [
    {
      "name": "ddl.sql",
      "from": "open_templates/db/mysql/ddl.sql",
      "to": "/sql/mysql/"
    },
    {
      "name": "ddl.sql",
      "from": "open_templates/db/postgresql/ddl.sql",
      "to": "/sql/postgresql/"
    }
  ],
  "variables": {
    "dbName": {
      "label": "数据库名"
    },
    "tableName": {
      "label": "表名"
    },
    "tableNameAlias": {
      "label": "表中文名"
    }
  },
  "fields": [
    {
      "fieldName": "deleteFlag",
      "alias": "逻辑删除标志",
      "type": "Integer"
    },
    {
      "fieldName": "creatorId",
      "alias": "创建者ID",
      "type": "Long"
    },
    {
      "fieldName": "insertTime",
      "alias": "插入时间",
      "type": "LocalDateTime"
    },
    {
      "fieldName": "updateTime",
      "alias": "更新时间",
      "type": "LocalDateTime"
    }
  ],
  "fieldOptions": {
    "fieldName": {
      "label": "字段名",
      "type": "input",
      "require": true
    },
    "alias": {
      "label": "备注名",
      "type": "input",
      "require": true
    },
    "type": {
      "label": "字段类型",
      "type": "select",
      "options": ["String", "Integer", "Long", "Double", "LocalDateTime"],
      "require": true
    },
    "__": {
      "type": "function",
      "function": "(item) => {item.__hump = item.fieldName.replace(/\\_(\\w)/g, function(all, letter){ return letter.toUpperCase()});item.__line = item.fieldName.replace(/([A-Z])/g,'_$1').toLowerCase()}"
    }
  }
}
```

- `fileStructure`用于声明文件目录结构，类型可以为`FileStructure`或者`filePath: string`
  - 当值为文件路径时，该文件会被当做模板来渲染，因此你可以在文件中使用ejs语法，该文件最终也会当做`FileStructure`
  - 文件目录结构用嵌套的`FileStructure`来声明，`key`为文件名，`value`为子目录

```
interface FileStructure {
    [key: string]: FileStructure
}
```

- `templates` 用于声明模板，类型为`Templates`
  - `name` 该模板最终形成的文件名，该值会被ejs渲染，可以使用ejs语法
  - `from` 该模板原路径
  - `to` 该模板放置的路径，该值会被ejs渲染，可以使用ejs语法

```
interface Templates {
    name: string
    from: string
    to: string
}
```

- `variables` 用于定义模板变量，类型为`Variables`
  - `key` 为模板变量名
  - `label` 为模板变量的显示名称
  - `default` 变量默认值(可选)
  - `rule` 用于校验变量输入值, 该值为js lambda函数(底层使用eval, 不能使用类型)，参数为 (rule: FormItemRule, value: string), 返回true即校验通过，校验不通过需要return new Error("提示语")

```
interface Variables {
    [key: string]: {
        label: string
        default: string
        rule: string
    }
}
```

- `fields` 用于定义预置的默认字段，类型为`Array<Record<string, string>`
  - 数组中的每项的每个字段都来源于`fieldOptions`

- `fieldOptions` 用于定义字段的配置项，类型为`Record<>`
  - `key` 字段配置项名称
  - `label` 字段配置项名称的显示名称
  - `type` 字段配置项类型，可选类型为'input' | 'bool' | 'select' | 'function'
  - `require` 该字段是否必填
  - `option` 当`type`为'select'时来配置可选项
  - `function` 当`type`为'function'生效, 该值为js lambda函数(底层使用eval, 不能使用类型), 参数为field: any,  即一个模板字段
  - `rule` 当`type`为'input'生效, 该值为js lambda函数(底层使用eval, 不能使用类型), 参数为field: string, 即input输入值,  返回true即校验通过，校验不通过返回false
```
interface FieldOptions {
    [key: string]: {
      label: string
      type: 'input' | 'bool' | 'select' | 'function'
      options?: Array<string>
      require?: boolean
      function?: string
      rule?: string
    }
}
```
<br>

## Template Develop

模板使用 [EJS Template Engine](https://ejs.co/)渲染，在渲染时会传入两个变量：

`variables`和`fields`

在编写模板时，如使用变量时，可像这样：

```
<%= variables.变量名 %>
```

如使用字段时，可像这样：

```
<% fields.forEach(field => { -%>
    <%= field.字段属性 %>
<% }) %>}
```
