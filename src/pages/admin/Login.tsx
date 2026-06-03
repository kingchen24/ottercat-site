import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cat, LogIn, ArrowLeft, Key, HelpCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { authApi } from '@/lib/api'

type Mode = 'login' | 'forgot';

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('login')

  // 忘记密码流程状态
  const [forgotStep, setForgotStep] = useState(1) // 1=输用户名, 2=答问题, 3=完成
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
    } catch (err: any) {
      setError(err.message || '登录失败')
      setLoading(false)
    }
  }

  // 忘记密码 - 第一步：获取密保问题
  const handleForgotStep1 = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.getSecurityQuestion(username)
      setSecurityQuestion(res.question)
      setForgotStep(2)
    } catch (err: any) {
      setError(err.message || '获取密保问题失败')
    } finally {
      setLoading(false)
    }
  }

  // 忘记密码 - 第二步：验证答案并重置
  const handleForgotStep2 = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.resetPassword(username, securityAnswer, newPassword)
      setSuccessMsg(res.message)
      setForgotStep(3)
    } catch (err: any) {
      setError(err.message || '重置失败')
    } finally {
      setLoading(false)
    }
  }

  // 重置回登录状态
  const resetToLogin = () => {
    setMode('login')
    setForgotStep(1)
    setError('')
    setSuccessMsg('')
    setSecurityAnswer('')
    setNewPassword('')
  }

  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-4">
              <HelpCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="font-serif text-xl font-bold text-stone-900">找回密码</h1>
            <p className="text-xs text-stone-400 mt-1">
              {forgotStep === 1 && '请输入管理员用户名'}
              {forgotStep === 2 && '请回答密保问题'}
              {forgotStep === 3 && '密码重置完成'}
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
            )}
            {successMsg && (
              <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{successMsg}</div>
            )}

            {/* 第一步：输入用户名 */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotStep1} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">管理员用户名</label>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 bg-stone-50"
                    placeholder="admin" required
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  <Key className="w-4 h-4" /> {loading ? '查询中...' : '获取密保问题'}
                </button>
              </form>
            )}

            {/* 第二步：回答密保问题 */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotStep2} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <p className="text-xs text-amber-600 mb-1">密保问题</p>
                  {securityQuestion}
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">答案</label>
                  <input
                    type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 bg-stone-50"
                    placeholder="请输入密保答案" required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">新密码（至少6位）</label>
                  <input
                    type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 bg-stone-50"
                    placeholder="设置新密码" required minLength={6}
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  <Key className="w-4 h-4" /> {loading ? '重置中...' : '重置密码'}
                </button>
              </form>
            )}

            {/* 第三步：完成 */}
            {forgotStep === 3 && (
              <div className="text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm text-stone-600 mb-4">密码重置成功！请使用新密码登录。</p>
                <button onClick={resetToLogin}
                  className="px-4 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors">
                  返回登录
                </button>
              </div>
            )}

            <button onClick={resetToLogin}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
              <ArrowLeft className="w-3 h-3" /> 返回登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 mb-4">
            <Cat className="w-8 h-8 text-stone-600" />
          </div>
          <h1 className="font-serif text-xl font-bold text-stone-900">獭猫数字工作室</h1>
          <p className="text-xs text-stone-400 mt-1">管理员登录</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 shadow-sm">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 bg-stone-50"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 bg-stone-50"
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? '正在登录...' : '进入工作室'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(''); setForgotStep(1); }}
              className="text-xs text-stone-400 hover:text-amber-600 transition-colors"
            >
              忘记密码？
            </button>
          </div>
        </form>

        <p className="text-center text-[11px] text-stone-300 mt-4">
          默认账号: admin / admin123
        </p>
      </div>
    </div>
  )
}
