import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import projectsRoutes from './routes/projects.js';
import timelinesRoutes from './routes/timelines.js';
import profileRoutes from './routes/profile.js';
import petChatRoutes from './routes/pet-chat.js';
import { authMiddleware } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/timelines', timelinesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/pet', petChatRoutes);

// 生产环境：托管前端构建文件
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🦦 獭猫数字工作室后端已启动 → http://localhost:${PORT}`);
  console.log(`📦 API 地址: http://localhost:${PORT}/api`);
  console.log(`🐱 獭猫宠物已就绪: /api/pet`);
});
