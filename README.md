### 介绍
后端主要集成权限管理（可基于接口级别权限）、代码生成，后续将已经插件形式开放更多功能；前端内置多种布局，基于按钮级别的权限，扩展多种form字段及table中预览展示的多个组件

### 软件架构
后端基于[workerman](https://www.workerman.net/)的[webman](https://www.workerman.net/webman)高性能HTTP框架，常用的[ThinkORM](https://doc.thinkphp.cn/@think-orm/)、[ThinkValidate](https://doc.thinkphp.cn/v8_0/validator.html)，前端基于`react`用`js`写的，主要用到的组件库是[Ant Design](https://ant.design/index-cn)、[ProComponents](https://procomponents.ant.design/)



### 安装教程

**环境要求**
- php >= 8.1
- mysql >= 5.6
- node >= 20

**php需要的扩展**
- fileinfo
- imagemagick
- exif
- xlswriter 表格导入导出用的此扩展，如导入导出换成其它逻辑可以不用安装
- redis 非必须，如果要用消息列队或缓存用redis

**php需要解除的禁用函数**
- [点此查看webman官方说明](https://www.workerman.net/doc/webman/others/disable-function-check.html)



1.启动项目

windows用户：双击项目根目录 `windows.bat` 或者在根目录运行 `php windows.php` 启动

linux用户：调试方式运行 `php start.php start`，守护进程方式运行 `php start.php start -d`



2.进行`根目录/public/admin_react/`，安装前端依赖
``` sh
npm install
```

3.运行前端，即可访问`http://localhost:5200/admin/`，登录的帐号密码为`admin/123456`
``` sh
npm run dev
```
