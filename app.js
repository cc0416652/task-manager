/**
 * 智能任务管理系统 - Express 应用主体
 * 本地由 server.js 启动监听；Vercel 上由 api/index.js 作为函数导出。
 * 技术栈：Node.js + Express + Supabase (PostgreSQL)
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ---------- 启动前检查 Supabase 配置 ----------
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    '缺少 Supabase 配置：请复制 .env.example 为 .env，并填写 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' +
      '（Supabase 控制台 -> Project Settings -> API 中获取）；部署到 Vercel 时请在项目 Settings -> Environment Variables 中配置。'
  );
}

// ---------- 初始化 Supabase 客户端 ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * GET /api/tasks?priority=高|中|低
 * 获取任务列表，按创建时间倒序（最新的在最上面）；
 * 传入 priority 时按优先级筛选，不传或为 all 时返回全部。
 */
app.get('/api/tasks', async (req, res) => {
  try {
    const { priority } = req.query;
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tasks
 * 添加任务，请求体：{ "title": "任务标题", "priority": "高" }
 * priority 可选值：高 / 中 / 低，默认 中
 */
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: '任务标题不能为空' });
    }

    const validPriorities = ['高', '中', '低'];
    const p = validPriorities.includes(priority) ? priority : '中';

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: title.trim(), priority: p })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/tasks/:id
 * 切换完成状态，请求体：{ "completed": true }
 */
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed 必须是布尔值 true / false' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/tasks/:id
 * 删除任务
 */
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
