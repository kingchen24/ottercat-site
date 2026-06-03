import { Router, Request, Response } from 'express';
import { getTimelines, createTimeline, updateTimeline, deleteTimeline } from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(getTimelines());
});

router.get('/admin/all', authMiddleware, (_req: AuthRequest, res: Response) => {
  res.json(getTimelines());
});

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { date_label, title } = req.body;
  if (!date_label || !title) return res.status(400).json({ error: '日期标签和标题不能为空' });
  const id = createTimeline(req.body);
  res.json({ id, message: '时间线条目创建成功' });
});

router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { date_label, title } = req.body;
  if (!date_label || !title) return res.status(400).json({ error: '日期标签和标题不能为空' });
  updateTimeline(Number(req.params.id), req.body);
  res.json({ message: '时间线条目更新成功' });
});

router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  deleteTimeline(Number(req.params.id));
  res.json({ message: '时间线条目已删除' });
});

export default router;
