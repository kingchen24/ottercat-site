import { useState, useEffect } from 'react'
import { Save, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { profileApi } from '@/lib/api'

export default function ProfileManager() {
  const [profile, setProfile] = useState<any>({})
  const [skills, setSkills] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileApi.get().then(data => {
      setProfile(data.profile || { name: '爱学习的獭猫', title: '', bio: '', email: '', github: '' });
      setSkills(data.skills || []);
    }).finally(() => setLoading(false));
  }, []);

  const showMsg = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const saveProfile = async () => {
    try {
      await profileApi.update(profile);
      showMsg('个人信息已保存');
    } catch (err: any) { showMsg(err.message); }
  };

  const saveSkills = async () => {
    try {
      await profileApi.updateSkills(skills);
      showMsg('技能列表已保存');
    } catch (err: any) { showMsg(err.message); }
  };

  const addSkill = () => setSkills([...skills, { name: '', subtitle: '', level: 50 }]);
  const removeSkill = (idx: number) => setSkills(skills.filter((_, i) => i !== idx));
  const updateSkill = (idx: number, field: string, value: any) => {
    const updated = [...skills];
    updated[idx] = { ...updated[idx], [field]: value };
    setSkills(updated);
  };

  if (loading) return <div className="text-stone-400">加载中...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-stone-400 hover:text-stone-600"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900">个人信息管理</h1>
      </div>

      {message && <div className="mb-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg">{message}</div>}

      {/* Profile */}
      <section className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <h2 className="font-serif font-bold text-stone-900 mb-4">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">名称</label>
            <input type="text" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">头衔</label>
            <input type="text" value={profile.title || ''} onChange={e => setProfile({ ...profile, title: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-stone-500 mb-1">个人简介</label>
            <textarea value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">邮箱</label>
            <input type="text" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">GitHub</label>
            <input type="text" value={profile.github || ''} onChange={e => setProfile({ ...profile, github: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
          </div>
        </div>
        <button onClick={saveProfile} className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors">
          <Save className="w-3.5 h-3.5" /> 保存基本信息
        </button>
      </section>

      {/* Skills */}
      <section className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif font-bold text-stone-900">技能列表</h2>
          <button onClick={addSkill} className="text-xs text-amber-700 hover:text-amber-800">+ 添加技能</button>
        </div>
        <div className="space-y-4">
          {skills.map((skill, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input type="text" value={skill.name} onChange={e => updateSkill(idx, 'name', e.target.value)} placeholder="技能名称" className="px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
                  <input type="text" value={skill.subtitle} onChange={e => updateSkill(idx, 'subtitle', e.target.value)} placeholder="副标题" className="px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
                  <div className="flex items-center gap-2">
                    <input type="range" min="0" max="100" value={skill.level} onChange={e => updateSkill(idx, 'level', parseInt(e.target.value))} className="flex-1" />
                    <span className="text-xs text-stone-400 w-10 text-right">{skill.level}%</span>
                  </div>
                </div>
              </div>
              <button onClick={() => removeSkill(idx)} className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 shrink-0 mt-1">✕</button>
            </div>
          ))}
        </div>
        <button onClick={saveSkills} className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors">
          <Save className="w-3.5 h-3.5" /> 保存技能列表
        </button>
      </section>
    </div>
  )
}
