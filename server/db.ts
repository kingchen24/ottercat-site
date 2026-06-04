import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 支持 Render Disk 持久化：设置 DATA_DIR 环境变量指向挂载的磁盘路径
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'database.json');

// 确保 data 目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 默认数据结构
const defaultData = {
  admins: [] as any[],
  profile: {} as any,
  skills: [] as any[],
  gears: [] as any[],
  interests: [] as any[],
  posts: [] as any[],
  projects: [] as any[],
  timelines: [] as any[],
  nextId: 1,
};

// 加载数据库
function load(): typeof defaultData {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return { ...defaultData, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('数据库文件损坏，将创建新数据库');
  }
  return { ...defaultData };
}

// 保存数据库
function save(data: typeof defaultData) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// 生成自增 ID
function nextId(data: typeof defaultData): number {
  const id = data.nextId;
  data.nextId++;
  return id;
}

// ========== 数据库操作 API ==========

// --- 管理员 ---
export function getAdmin(username: string) {
  const data = load();
  return data.admins.find(a => a.username === username) || null;
}

export function getAdminById(id: number) {
  const data = load();
  return data.admins.find(a => a.id === id) || null;
}

export function createAdmin(username: string, passwordHash: string, securityQuestion?: string, securityAnswerHash?: string) {
  const data = load();
  const id = nextId(data);
  data.admins.push({
    id,
    username,
    password_hash: passwordHash,
    security_question: securityQuestion || '',
    security_answer_hash: securityAnswerHash || '',
    created_at: new Date().toISOString(),
  });
  save(data);
  return id;
}

export function updateAdminPassword(id: number, passwordHash: string) {
  const data = load();
  const admin = data.admins.find(a => a.id === id);
  if (admin) {
    admin.password_hash = passwordHash;
    save(data);
    return true;
  }
  return false;
}

export function getAdminSecurityQuestion(username: string): { question: string } | null {
  const data = load();
  const admin = data.admins.find(a => a.username === username);
  if (!admin || !admin.security_question) return null;
  return { question: admin.security_question };
}

export function verifySecurityAnswer(username: string, answer: string): number | null {
  const data = load();
  const admin = data.admins.find(a => a.username === username);
  if (!admin || !admin.security_answer_hash) return null;
  const bcrypt = require('bcryptjs');
  if (bcrypt.compareSync(answer, admin.security_answer_hash)) {
    return admin.id;
  }
  return null;
}

export function clearAdmins() {
  const data = load();
  data.admins = [];
  save(data);
}

// --- 个人信息 ---
export function getProfile() {
  const data = load();
  return data.profile || {};
}

export function saveProfile(profile: any) {
  const data = load();
  data.profile = { ...data.profile, ...profile, updated_at: new Date().toISOString() };
  save(data);
}

export function clearProfile() {
  const data = load();
  data.profile = {};
  save(data);
}

// --- 技能 ---
export function getSkills() {
  const data = load();
  return data.skills.sort((a, b) => a.sort_order - b.sort_order);
}

export function saveSkills(skills: any[]) {
  const data = load();
  data.skills = skills.map((s, i) => ({ ...s, id: s.id || nextId(data), sort_order: i }));
  save(data);
}

export function clearSkills() {
  const data = load();
  data.skills = [];
  save(data);
}

// --- 装备 ---
export function getGears() {
  const data = load();
  return data.gears.sort((a, b) => a.sort_order - b.sort_order);
}

export function addGear(name: string) {
  const data = load();
  const id = nextId(data);
  data.gears.push({ id, name, sort_order: data.gears.length });
  save(data);
  return id;
}

export function clearGears() {
  const data = load();
  data.gears = [];
  save(data);
}

// --- 兴趣爱好 ---
export function getInterests() {
  const data = load();
  return data.interests.sort((a, b) => a.sort_order - b.sort_order);
}

export function addInterest(content: string) {
  const data = load();
  const id = nextId(data);
  data.interests.push({ id, content, sort_order: data.interests.length });
  save(data);
  return id;
}

export function clearInterests() {
  const data = load();
  data.interests = [];
  save(data);
}

// --- 博客文章 ---
export function getPosts(publishedOnly = false) {
  const data = load();
  let posts = data.posts;
  if (publishedOnly) {
    posts = posts.filter(p => p.published === 1);
  }
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getPostById(id: number) {
  const data = load();
  return data.posts.find(p => p.id === id) || null;
}

export function getPostBySlug(slug: string, publishedOnly = false) {
  const data = load();
  const post = data.posts.find(p => p.slug === slug);
  if (!post) return null;
  if (publishedOnly && post.published !== 1) return null;
  return post;
}

export function createPost(post: any) {
  const data = load();
  const id = nextId(data);
  const now = new Date().toISOString();
  data.posts.push({
    ...post,
    id,
    tags: typeof post.tags === 'string' ? post.tags : JSON.stringify(post.tags || []),
    created_at: now,
    updated_at: now,
  });
  save(data);
  return id;
}

export function updatePost(id: number, updates: any) {
  const data = load();
  const idx = data.posts.findIndex(p => p.id === id);
  if (idx === -1) return false;
  data.posts[idx] = {
    ...data.posts[idx],
    ...updates,
    tags: typeof updates.tags === 'string' ? updates.tags : JSON.stringify(updates.tags || []),
    updated_at: new Date().toISOString(),
  };
  save(data);
  return true;
}

export function deletePost(id: number) {
  const data = load();
  data.posts = data.posts.filter(p => p.id !== id);
  save(data);
  return true;
}

export function clearPosts() {
  const data = load();
  data.posts = [];
  save(data);
}

// --- 项目 ---
export function getProjects() {
  const data = load();
  return data.projects.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function createProject(project: any) {
  const data = load();
  const id = nextId(data);
  data.projects.push({ ...project, id, created_at: new Date().toISOString() });
  save(data);
  return id;
}

export function updateProject(id: number, updates: any) {
  const data = load();
  const idx = data.projects.findIndex(p => p.id === id);
  if (idx === -1) return false;
  data.projects[idx] = { ...data.projects[idx], ...updates };
  save(data);
  return true;
}

export function deleteProject(id: number) {
  const data = load();
  data.projects = data.projects.filter(p => p.id !== id);
  save(data);
  return true;
}

export function clearProjects() {
  const data = load();
  data.projects = [];
  save(data);
}

// --- 时间线 ---
export function getTimelines() {
  const data = load();
  return data.timelines.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function createTimeline(item: any) {
  const data = load();
  const id = nextId(data);
  data.timelines.push({ ...item, id, created_at: new Date().toISOString() });
  save(data);
  return id;
}

export function updateTimeline(id: number, updates: any) {
  const data = load();
  const idx = data.timelines.findIndex(t => t.id === id);
  if (idx === -1) return false;
  data.timelines[idx] = { ...data.timelines[idx], ...updates };
  save(data);
  return true;
}

export function deleteTimeline(id: number) {
  const data = load();
  data.timelines = data.timelines.filter(t => t.id !== id);
  save(data);
  return true;
}

export function clearTimelines() {
  const data = load();
  data.timelines = [];
  save(data);
}
