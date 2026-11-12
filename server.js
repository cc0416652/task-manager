/**
 * 智能任务管理系统 - 本地启动入口
 * 启动方式：
 *   1. 复制 .env.example 为 .env，填入你的 Supabase 项目地址和 publishable key
 *   2. npm install
 *   3. npm run dev   （开发模式，改代码自动重启）
 *   4. 浏览器打开 http://localhost:3000
 *
 * 说明：Vercel 部署时入口是 api/index.js，不需要运行本文件。
 */

require('dotenv').config();

let app;
try {
  app = require('./app');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`智能任务管理系统已启动：http://localhost:${PORT}`);
});
