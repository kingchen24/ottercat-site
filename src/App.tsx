import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import BlogList from './pages/BlogList'
import BlogDetail from './pages/BlogDetail'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import { AuthProvider } from './lib/auth'

export default function App() {
  return (
    <AuthProvider>
      <div className="bg-grid-notebook min-h-screen flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
        <Routes>
          {/* 管理后台路由 - 不含前台Header/Footer */}
          <Route path="/admin/*" element={
            <Routes>
              <Route path="login" element={<AdminLogin />} />
              <Route path="*" element={<AdminDashboard />} />
            </Routes>
          } />

          {/* 前台路由 - 含Header/Footer */}
          <Route path="*" element={
            <>
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/notes" element={<BlogList />} />
                  <Route path="/notes/:slug" element={<BlogDetail />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}
