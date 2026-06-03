import { Router, Request, Response } from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(getProjects());
});

router.get('/admin/all', authMiddleware, (_req: AuthRequest, res: Response) => {
  res.json(getProjects());
});

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.body.title) return res.status(400).json({ error: '项目名称不能为空' });
  const id = createProject(req.body);
  res.json({ id, message: '项目创建成功' });
});

router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.body.title) return res.status(400).json({ error: '项目名称不能为空' });
  updateProject(Number(req.params.id), req.body);
  res.json({ message: '项目更新成功' });
});

router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  deleteProject(Number(req.params.id));
  res.json({ message: '项目已删除' });
});

export default router;
