import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Key, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function SecurityManager() {
  const { changePassword, logout } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const showMsg = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setMessage('');
      setTimeout(() => setError(''), 4000);
    } else {
      setMessage(msg);
      setError('');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      showMsg('新密码至少需要6个字符', true);
      return;
    }

    if (newPassword !== confirmPassword) {
      showMsg('两次输入的新密码不一致', true);
      return;
    }

    if (oldPassword === newPassword) {
      showMsg('新密码不能与旧密码相同', true);
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      showMsg('密码修改成功！请使用新密码重新登录');
      // 清除旧密码并提示重新登录
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // 5秒后自动退出重新登录
      setTimeout(() => logout(), 2000);
    } catch (err: any) {
      showMsg(err.message || '修改失败', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-stone-400 hover:text-stone-600"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900">安全设置</h1>
      </div>

      {message && (
        <div className="mb-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-stone-900">修改登录密码</h2>
            <p className="text-xs text-stone-400">修改后需重新登录</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">当前密码</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                placeholder="输入当前密码"
                required
              />
              <button type="button" onClick={() => setShowOld(!showOld)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">新密码</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                placeholder="输入新密码（至少6位）"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
              placeholder="再次输入新密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> {loading ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>
    </div>
  )
}
