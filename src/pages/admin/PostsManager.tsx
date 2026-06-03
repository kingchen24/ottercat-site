import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Eye, Save, X, ArrowLeft, Upload, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { postsApi } from '@/lib/api'

interface PostForm {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  read_time: number;
  mood: string;
  icon: string;
  published: boolean;
}

const emptyForm: PostForm = {
  title: '', slug: '', summary: '', content: '',
  category: '未分类', tags: '', read_time: 5, mood: '', icon: 'cpu', published: true,
};

export default function PostsManager() {
  const [posts, setPosts] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<PostForm>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const loadPosts = () => {
    postsApi.adminList().then(setPosts);
  };

  useEffect(() => { loadPosts(); }, []);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editing) {
        await postsApi.update(editing.id, data);
        showMsg('文章已更新');
      } else {
        await postsApi.create(data);
        showMsg('文章已发布');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      loadPosts();
    } catch (err: any) {
      showMsg(err.message || '操作失败');
    }
  };

  const handleEdit = (post: any) => {
    setEditing(post);
    const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || [];
    setForm({
      title: post.title,
      slug: post.slug,
      summary: post.summary || '',
      content: post.content || '',
      category: post.category || '未分类',
      tags: tags.join(', '),
      read_time: post.read_time || 5,
      mood: post.mood || '',
      icon: post.icon || 'cpu',
      published: post.published === 1,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    await postsApi.delete(id);
    showMsg('文章已删除');
    loadPosts();
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, slug: 'post-' + Date.now() });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="text-stone-400 hover:text-stone-600"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900">博客文章管理</h1>
        <button onClick={handleNew} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg hover:bg-stone-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> 写新文章
        </button>
      </div>

      {message && (
        <div className="mb-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg">
          {message}
        </div>
      )}

      {/* Post Form Modal-ish */}
      {showForm && (
        <div className="mb-6 bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif font-bold text-stone-900">{editing ? '编辑文章' : '新建文章'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">标题 *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">URL别名 *</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">摘要</label>
              <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-stone-500">正文 (支持 Markdown)</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer text-xs text-stone-400 hover:text-amber-600 transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                    从文件读取 .md / .txt
                    <input
                      type="file"
                      accept=".md,.txt,.markdown"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const text = await file.text();
                        setForm({ ...form, content: form.content ? form.content + '\n\n---\n\n' + text : text });
                        showMsg(`已读取文件: ${file.name}`);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
              <div
                className="relative border border-stone-200 rounded-lg focus-within:border-stone-400 transition-colors"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-amber-400', 'bg-amber-50/30'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-amber-400', 'bg-amber-50/30'); }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-amber-400', 'bg-amber-50/30');
                  const file = [...e.dataTransfer.files].find(f => f.name.endsWith('.md') || f.name.endsWith('.txt') || f.name.endsWith('.markdown'));
                  if (!file) {
                    showMsg('仅支持 .md / .txt 文件');
                    return;
                  }
                  const text = await file.text();
                  setForm({ ...form, content: form.content ? form.content + '\n\n---\n\n' + text : text });
                  showMsg(`已拖入文件: ${file.name}`);
                }}
              >
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 text-sm font-mono border-0 rounded-lg focus:outline-none resize-y bg-transparent"
                  placeholder="在这里写 Markdown 正文...&#10;&#10;提示：可以直接将 .md / .txt 文件拖拽到此处导入内容"
                />
                {!form.content && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-2 text-stone-300">
                      <Upload className="w-8 h-8" />
                      <span className="text-xs">拖拽 .md / .txt 文件到此处，或点击上方「从文件读取」</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">分类</label>
                <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">标签 (逗号分隔)</label>
                <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" placeholder="深度学习, Transformer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">阅读时长 (分钟)</label>
                <input type="number" value={form.read_time} onChange={e => setForm({ ...form, read_time: parseInt(e.target.value) || 5 })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">心情/天气</label>
                <input type="text" value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="rounded" />
                发布（取消勾选则存为草稿）
              </label>
              <select value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400">
                <option value="cpu">芯片 (cpu)</option>
                <option value="beaker">烧杯 (beaker)</option>
                <option value="binary">二进制 (binary)</option>
              </select>
            </div>

            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors">
              <Save className="w-3.5 h-3.5" /> {editing ? '更新文章' : '发布文章'}
            </button>
          </form>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-stone-500">标题</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 hidden md:table-cell">分类</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 hidden md:table-cell">状态</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 hidden md:table-cell">日期</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-900 truncate max-w-[300px]">{post.title}</div>
                    <div className="text-xs text-stone-400">{post.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-500 hidden md:table-cell">{post.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${post.published ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-400'}`}>
                      {post.published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs hidden md:table-cell">{post.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {post.published === 1 && (
                        <a href={`/notes/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600">
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => handleEdit(post)} className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-amber-600">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">还没有文章，点击右上角"写新文章"开始创作</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
