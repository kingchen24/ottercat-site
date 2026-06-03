import { Router, Request, Response } from 'express';
import { getPosts, getPostBySlug, getPostById, createPost, updatePost, deletePost } from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

// 公开：获取已发布文章
router.get('/', (_req: Request, res: Response) => {
  res.json(getPosts(true));
});

// 公开：通过 slug 获取文章
router.get('/:slug', (req: Request, res: Response) => {
  const post = getPostBySlug(req.params.slug, true);
  if (!post) return res.status(404).json({ error: '文章不存在' });
  res.json(post);
});

// 管理员：获取所有文章
router.get('/admin/all', authMiddleware, (_req: AuthRequest, res: Response) => {
  res.json(getPosts(false));
});

// 管理员：通过 ID 获取文章
router.get('/admin/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const post = getPostById(Number(req.params.id));
  if (!post) return res.status(404).json({ error: '文章不存在' });
  res.json(post);
});

// 管理员：创建文章
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, slug } = req.body;
  if (!title || !slug) return res.status(400).json({ error: '标题和URL别名不能为空' });

  const existing = getPostBySlug(slug);
  if (existing) return res.status(400).json({ error: 'URL别名已存在' });

  const id = createPost(req.body);
  res.json({ id, message: '文章创建成功' });
});

// 管理员：更新文章
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, slug } = req.body;
  if (!title || !slug) return res.status(400).json({ error: '标题和URL别名不能为空' });

  const existing = getPostBySlug(slug);
  if (existing && existing.id !== Number(req.params.id)) {
    return res.status(400).json({ error: 'URL别名已被其他文章使用' });
  }

  updatePost(Number(req.params.id), req.body);
  res.json({ message: '文章更新成功' });
});

// 管理员：删除文章
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  deletePost(Number(req.params.id));
  res.json({ message: '文章已删除' });
});

export default router;
