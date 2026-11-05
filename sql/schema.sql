-- ============================================
-- 智能任务管理系统 - Supabase 建表脚本
-- 使用方法：Supabase 控制台 -> SQL Editor -> 粘贴执行
-- 注意：你的项目中 tasks 表已存在且结构一致，无需重复执行；
--       本脚本用于在全新项目中初始化表结构。
-- ============================================

-- 任务表
create table if not exists public.tasks (
  id bigint generated always as identity primary key,  -- 自增主键
  title text not null,                                  -- 任务标题
  priority text not null default '中'                   -- 优先级：高 / 中 / 低
    check (priority in ('高', '中', '低')),
  completed boolean not null default false,             -- 是否完成
  created_at timestamptz not null default now()         -- 创建时间
);

-- 学习/个人项目：直接关闭行级安全，publishable key 即可读写
alter table public.tasks disable row level security;

-- 生产环境建议改为开启 RLS 并建策略（取消下面三行注释即可）：
-- alter table public.tasks enable row level security;
-- create policy "allow_all_tasks" on public.tasks
--   for all using (true) with check (true);
