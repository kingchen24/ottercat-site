import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Cat, FileText, FolderGit2, Milestone, UserCircle, LogOut, Menu, X, ExternalLink, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import PostsManager from './PostsManager'
import ProjectsManager from './ProjectsManager'
import TimelineManager from './TimelineManager'
import ProfileManager from './ProfileManager'
import SecurityManager from './SecurityManager'

const navItems = [
  { path: '/admin/posts', label: '博客文章', icon: FileText },
  { path: '/admin/projects', label: '科研项目', icon: FolderGit2 },
  { path: '/admin/timeline', label: '时间线', icon: Milestone },
  { path: '/admin/profile', label: '个人信息', icon: UserCircle },
];

const bottomNavItems = [
  { path: '/admin/security', label: '安全设置', icon: Shield },
];

export default function Dashboard() {
  const { isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400">验证中...</div>;
  if (!isAuthenticated) return null;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-200">
        <Link to="/admin" className="flex items-center gap-2">
          <Cat className="w-5 h-5 text-amber-600" />
          <span className="font-serif font-bold text-stone-900">獭猫工作室</span>
        </Link>
        <p className="text-[10px] text-stone-400 mt-0.5">管理系统</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-stone-200/60 text-stone-900' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-stone-200 space-y-2">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive ? 'bg-amber-50 text-amber-700 font-medium' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          预览网站
        </a>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          退出登录
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-56 bg-white border-r border-stone-200 hidden md:flex flex-col">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-stone-200">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-stone-600" />
            </button>
            <span className="font-serif font-bold text-stone-900">獭猫工作室</span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/posts/*" element={<PostsManager />} />
            <Route path="/projects" element={<ProjectsManager />} />
            <Route path="/timeline" element={<TimelineManager />} />
            <Route path="/profile" element={<ProfileManager />} />
            <Route path="/security" element={<SecurityManager />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function DashboardHome() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/posts/admin/all').then(r => r.json()),
      fetch('/api/projects/admin/all').then(r => r.json()),
      fetch('/api/timelines/admin/all').then(r => r.json()),
    ]).then(([posts, projects, timelines]) => {
      setStats({ posts: posts.length, projects: projects.length, timelines: timelines.length });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: '博客文章', value: loading ? '...' : stats?.posts || 0, link: '/admin/posts', icon: FileText, color: 'bg-amber-50 text-amber-700' },
    { label: '科研项目', value: loading ? '...' : stats?.projects || 0, link: '/admin/projects', icon: FolderGit2, color: 'bg-blue-50 text-blue-700' },
    { label: '时间线', value: loading ? '...' : stats?.timelines || 0, link: '/admin/timeline', icon: Milestone, color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-stone-900 mb-1">工作台</h1>
      <p className="text-sm text-stone-400 mb-8">欢迎回到数字工作室，獭猫。</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.link} className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-stone-900">{card.value}</div>
              <div className="text-sm text-stone-500 mt-1">{card.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <h2 className="font-serif text-lg font-bold text-stone-900 mb-4">快捷操作</h2>
        <div className="space-y-2">
          <Link to="/admin/posts" className="block text-sm text-amber-700 hover:text-amber-800 transition-colors">
            ✍️ 写一篇新博客
          </Link>
          <Link to="/admin/projects" className="block text-sm text-blue-700 hover:text-blue-800 transition-colors">
            🔬 添加新项目
          </Link>
          <Link to="/admin/timeline" className="block text-sm text-emerald-700 hover:text-emerald-800 transition-colors">
            📅 记录新动态
          </Link>
        </div>
      </div>
    </div>
  )
}
