import { Router, Request, Response } from 'express';
import { getProfile, saveProfile, getSkills, saveSkills, getGears, getInterests } from '../db.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    profile: getProfile(),
    skills: getSkills(),
    gears: getGears(),
    interests: getInterests(),
  });
});

router.put('/', authMiddleware, (req: AuthRequest, res: Response) => {
  saveProfile(req.body);
  res.json({ message: '个人信息更新成功' });
});

router.put('/skills', authMiddleware, (req: AuthRequest, res: Response) => {
  const { skills } = req.body;
  if (!Array.isArray(skills)) return res.status(400).json({ error: 'skills 必须是数组' });
  saveSkills(skills);
  res.json({ message: '技能列表更新成功' });
});

export default router;
