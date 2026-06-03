import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { timelinesApi } from '@/lib/api'

interface TimelineForm {
  date_label: string;
  title: string;
  description: string;
  highlight: boolean;
}

const emptyForm: TimelineForm = { date_label: '', title: '', description: '', highlight: false };

export default function TimelineManager() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<TimelineForm>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const load = () => timelinesApi.adminList().then(setItems);
  useEffect(() => { load(); }, []);

  const showMsg = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await timelinesApi.update(editing.id, form);
        showMsg('时间线已更新');
      } else {
        await timelinesApi.create(form);
        showMsg('时间线已创建');
      }
      setShowForm(false); setEditing(null); setForm(emptyForm); load();
    } catch (err: any) { showMsg(err.message); }
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ date_label: item.date_label, title: item.title, description: item.description || '', highlight: item.highlight === 1 });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await timelinesApi.delete(id);
    showMsg('已删除');
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-stone-400 hover:text-stone-600"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900">时间线管理</h1>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg hover:bg-stone-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> 添加动态
        </button>
      </div>

      {message && <div className="mb-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg">{message}</div>}

      {showForm && (
        <div className="mb-6 bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif font-bold text-stone-900">{editing ? '编辑动态' : '新建动态'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">日期标签 *</label>
                <input type="text" value={form.date_label} onChange={e => setForm({ ...form, date_label: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" placeholder="2026.05" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">标题 *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">描述</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" checked={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.checked })} className="rounded" />
              高亮显示（琥珀色标记）
            </label>
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors">
              <Save className="w-3.5 h-3.5" /> {editing ? '更新' : '创建'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {items.map(item => (
          <div key={item.id} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <span className={`text-xs font-mono font-semibold min-w-[60px] ${item.highlight ? 'text-amber-700' : 'text-stone-400'}`}>{item.date_label}</span>
              <div>
                <h4 className="text-sm font-medium text-stone-900">{item.title}</h4>
                <p className="text-xs text-stone-400 line-clamp-1">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleEdit(item)} className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-amber-600"><Edit className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-stone-400 py-8">还没有时间线动态</p>}
      </div>
    </div>
  )
}
