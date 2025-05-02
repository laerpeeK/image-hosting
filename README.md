# image-hosting

由 Express 构建的简单的图片存储服务

## 功能

- 多图片上传。
- 保存到具体文件夹下（支持多层级）。
- 可以选择生成随机 uuid 文件名。
- 返回图片存储路径，用于客户端项目调用。
- `uploaded_images.log`查看上传日志。

## 运行方式

- npm install
- npm run dev
- 浏览器打开：http://127.0.0.1:3000

## 持久化

- npm install pm2 -g
- pm2 start app.js

## 示例

![](https://github.com/laerpeeK/image-hosting/blob/main/uploads/27d2ad81-79ba-4ff1-9afd-8b123440993a.png)  
![](https://github.com/laerpeeK/image-hosting/blob/main/uploads/27d2ad81-79ba-4ff1-9afd-8b123440993a.png)  
![](https://github.com/laerpeeK/image-hosting/blob/main/uploads/4b334694-8e5c-4ab4-b8ab-dcb800acb9cb.png)
