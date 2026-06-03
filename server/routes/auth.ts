import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAdmin, getAdminById, updateAdminPassword, getAdminSecurityQuestion, verifySecurityAnswer } from '../db.js';
import { AuthRequest, authMiddleware, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// 登录
router.post('/login', (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  const admin = getAdmin(username);
  if (!admin) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, message: '登录成功' });
});

// 修改密码（登录后）
router.put('/password', authMiddleware, (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '请输入旧密码和新密码' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密码至少需要6个字符' });
  }

  const admin = getAdminById(req.adminId!);
  if (!admin) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const valid = bcrypt.compareSync(oldPassword, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: '旧密码错误' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  updateAdminPassword(req.adminId!, hash);
  res.json({ message: '密码修改成功' });
});

// 获取密保问题（忘记密码第一步）
router.post('/forgot-question', (req: AuthRequest, res: Response) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: '请输入用户名' });
  }

  const result = getAdminSecurityQuestion(username);
  if (!result) {
    return res.status(404).json({ error: '该用户未设置密保问题，请联系管理员通过 data/database.json 重置密码' });
  }

  res.json({ question: result.question });
});

// 验证密保答案并重置密码（忘记密码第二步）
router.post('/forgot-reset', (req: AuthRequest, res: Response) => {
  const { username, answer, newPassword } = req.body;

  if (!username || !answer || !newPassword) {
    return res.status(400).json({ error: '请填写完整信息' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密码至少需要6个字符' });
  }

  const adminId = verifySecurityAnswer(username, answer);
  if (!adminId) {
    return res.status(401).json({ error: '密保答案错误' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  updateAdminPassword(adminId, hash);
  res.json({ message: '密码重置成功，请使用新密码登录' });
});

// 验证 token
router.get('/verify', authMiddleware, (_req: AuthRequest, res: Response) => {
  res.json({ valid: true });
});

export default router;
