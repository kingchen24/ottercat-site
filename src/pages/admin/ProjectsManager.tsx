import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { projectsApi } from '@/lib/api'

interface ProjectForm {
  title: string;
  description: string;
  icon: string;
  tech: string;
  color: string;
  github_url: string;
  external_url: string;
  sort_order: number;
}

const emptyForm: ProjectForm = {
  title: '', description: '', icon: 'cpu', tech: '', color: 'amber', github_url: '', external_url: '', sort_order: 0,
};

const colors = [
  { value: 'amber', label: '琥珀', cls: 'bg-amber-400' },
  { value: 'orange', label: '橙色', cls: 'bg-orange-400' },
  { value: 'blue', label: '蓝色', cls: 'bg-blue-400' },
  { value: 'green', label: '绿色', cls: 'bg-emerald-400' },
  { value: 'purple', label: '紫色', cls: 'bg-purple-400' },
];

const icons = [
  { value: 'cpu', label: '芯片' },
  { value: 'calendar-heart', label: '日历心' },
  { value: 'binary', label: '二进制' },
  { value: 'beaker', label: '烧杯' },
  { value: 'globe', label: '地球' },
];

export default function ProjectsManager() {
  const [projects, setProjects] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<ProjectForm>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const load = () => projectsApi.adminList().then(setProjects);
  useEffect(() => { load(); }, []);

  const showMsg = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await projectsApi.update(editing.id, form);
        showMsg('项目已更新');
      } else {
        await projectsApi.create(form);
        showMsg('项目已创建');
      }
      setShowForm(false); setEditing(null); setForm(emptyForm); load();
    } catch (err: any) { showMsg(err.message); }
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description || '', icon: p.icon, tech: p.tech || '', color: p.color || 'amber', github_url: p.github_url || '', external_url: p.external_url || '', sort_order: p.sort_order || 0 });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此项目？')) return;
    await projectsApi.delete(id);
    showMsg('项目已删除');
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-stone-400 hover:text-stone-600"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900">科研项目管理</h1>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg hover:bg-stone-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> 添加项目
        </button>
      </div>

      {message && <div className="mb-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg">{message}</div>}

      {showForm && (
        <div className="mb-6 bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif font-bold text-stone-900">{editing ? '编辑项目' : '新建项目'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">项目名称 *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">技术栈</label>
                <input type="text" value={form.tech} onChange={e => setForm({ ...form, tech: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" placeholder="Verilog / 计算机体系结构" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">项目描述</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">图标</label>
                <select value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400">
                  {icons.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">颜色</label>
                <div className="flex gap-1.5 mt-1">
                  {colors.map(c => (
                    <button key={c.value} type="button" onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-6 h-6 rounded-full ${c.cls} ${form.color === c.value ? 'ring-2 ring-offset-1 ring-stone-400' : ''}`}
                      title={c.label} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">GitHub 链接</label>
                <input type="text" value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">排序</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
              </div>
            </div>

            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors">
              <Save className="w-3.5 h-3.5" /> {editing ? '更新' : '创建'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(p => (
          <div key={p.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="font-serif font-bold text-stone-900">{p.title}</h3>
              <p className="text-xs text-stone-500 line-clamp-2">{p.description}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-stone-400">
                <span className={`w-1.5 h-1.5 rounded-full bg-${p.color}-400`}></span>
                {p.tech}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-amber-600"><Edit className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="col-span-2 text-center text-stone-400 py-8">还没有项目</p>}
      </div>
    </div>
  )
}
