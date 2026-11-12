/**
 * Vercel Serverless 入口
 * 将 Express 应用导出为 serverless 函数，所有请求经 vercel.json 的 rewrites 进入这里。
 */

require('dotenv').config();

module.exports = require('../app');
