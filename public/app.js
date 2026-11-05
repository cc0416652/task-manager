/**
 * 智能任务管理系统 - 前端逻辑
 * 负责：添加任务、渲染列表、完成/未完成切换、删除、按优先级筛选
 */

// ---------- DOM 元素 ----------
const taskListEl = document.getElementById('task-list');
const emptyTipEl = document.getElementById('empty-tip');
const taskCountEl = document.getElementById('task-count');
const addForm = document.getElementById('add-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const filterBar = document.querySelector('.filter-bar');

// 优先级显示映射（与数据库中的中文值一一对应）
const PRIORITY_MAP = {
  '高': { label: '高', className: 'high' },
  '中': { label: '中', className: 'medium' },
  '低': { label: '低', className: 'low' }
};

// 当前筛选条件：all / 高 / 中 / 低
let currentFilter = 'all';

// ---------- API 请求封装 ----------
async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || '请求失败');
  }
  if (res.status === 204) return null;
  return res.json();
}

function getTasks() {
  const url = currentFilter === 'all' ? '/api/tasks' : `/api/tasks?priority=${currentFilter}`;
  return apiRequest(url);
}

function addTask(title, priority) {
  return apiRequest('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, priority })
  });
}

function updateTask(id, completed) {
  return apiRequest(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed })
  });
}

function deleteTask(id) {
  return apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
}

// ---------- 工具函数 ----------
function formatTime(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------- 渲染 ----------
function createTaskItem(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.id = task.id;

  // 完成状态圆圈（点击也可切换）
  const check = document.createElement('button');
  check.className = 'task-check' + (task.completed ? ' done' : '');
  check.title = task.completed ? '标记为未完成' : '标记为完成';
  check.addEventListener('click', () => toggleTask(task, check));

  // 任务主体：标题 + 创建时间
  const body = document.createElement('div');
  body.className = 'task-body';

  const title = document.createElement('div');
  title.className = 'task-title' + (task.completed ? ' done' : '');
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  meta.textContent = `创建于 ${formatTime(task.created_at)}`;

  body.appendChild(title);
  body.appendChild(meta);

  // 优先级标签
  const badge = document.createElement('span');
  const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP['中'];
  badge.className = `badge ${p.className}`;
  badge.textContent = p.label;

  // 完成/未完成切换按钮
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'btn-toggle' + (task.completed ? ' done' : '');
  toggleBtn.textContent = task.completed ? '未完成' : '完成';
  toggleBtn.addEventListener('click', () => toggleTask(task, check, toggleBtn));

  // 删除按钮
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete';
  deleteBtn.textContent = '删除';
  deleteBtn.addEventListener('click', () => removeTask(task.id, li));

  li.append(check, body, badge, toggleBtn, deleteBtn);
  return li;
}

// 切换完成状态
async function toggleTask(task, checkEl, toggleBtnEl) {
  const next = !task.completed;
  try {
    const updated = await updateTask(task.id, next);
    task.completed = updated.completed;

    checkEl.classList.toggle('done', task.completed);
    checkEl.title = task.completed ? '标记为未完成' : '标记为完成';

    if (toggleBtnEl) {
      toggleBtnEl.classList.toggle('done', task.completed);
      toggleBtnEl.textContent = task.completed ? '未完成' : '完成';
    }

    // 标题删除线
    const titleEl = checkEl.parentElement.querySelector('.task-title');
    titleEl.classList.toggle('done', task.completed);
  } catch (err) {
    alert(err.message);
  }
}

// 删除任务
async function removeTask(id, li) {
  if (!confirm('确定要删除该任务吗？')) return;
  try {
    await deleteTask(id);
    li.remove();
    updateCount();
  } catch (err) {
    alert(err.message);
  }
}

// 渲染整个列表
function renderTasks(tasks) {
  taskListEl.innerHTML = '';
  if (tasks.length === 0) {
    emptyTipEl.hidden = false;
  } else {
    emptyTipEl.hidden = true;
    for (const task of tasks) {
      taskListEl.appendChild(createTaskItem(task));
    }
  }
  updateCount(tasks.length);
}

function updateCount(count) {
  taskCountEl.textContent =
    count !== undefined ? `共 ${count} 条任务` : `共 ${taskListEl.children.length} 条任务`;
}

async function loadTasks() {
  try {
    const tasks = await getTasks();
    renderTasks(tasks);
  } catch (err) {
    alert(err.message);
  }
}

// ---------- 事件绑定 ----------
// 添加任务
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }
  try {
    await addTask(title, prioritySelect.value);
    taskInput.value = '';
    taskInput.focus();
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
});

// 按优先级筛选
filterBar.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  currentFilter = btn.dataset.priority;
  filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  loadTasks();
});

// ---------- 启动：加载任务 ----------
loadTasks();
