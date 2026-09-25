'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // Để chuyển hướng trang
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
  Users,
} from 'lucide-react'

export default function Page() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // 1. Quản lý State cho dữ liệu Form
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: ''
  })

  const isSignUp = mode === 'signup'

  // 2. Cập nhật dữ liệu khi người dùng gõ vào ô Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // 3. Hàm gửi Request kết nối tới API Spring Boot
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const endpoint = isSignUp 
      ? 'http://localhost:8080/api/auth/register' 
      : 'http://localhost:8080/api/auth/login'

    const payload = isSignUp 
      ? {
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        }
      : {
          username: formData.username,
          password: formData.password
        }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      // CHÚ Ý: Kiểm tra response.ok TRƯỚC khi parse dữ liệu
      if (response.ok) {
        if (isSignUp) {
          alert('Đăng ký tài khoản thành công! Hãy chuyển sang Đăng nhập.')
          setMode('signin') // Tự động chuyển qua tab Sign In
        } else {
          // Chỉ parse JSON khi ĐĂNG NHẬP thành công
          const data = await response.json()
          
          // Đọc đúng token (chấp nhận cả 'token' lẫn 'accessToken')
          const token = data.token || data.accessToken
          
          if (token) {
            localStorage.setItem('accessToken', token)
            alert(`Đăng nhập thành công! Xin chào ${data.fullName || data.username || ''}`)
            router.push('/dashboard') // Chuyển hướng sang trang Dashboard
          } else {
            alert('Đăng nhập thất bại: Không nhận được Token từ Server!')
          }
        }
      } else {
        // Nếu Server trả về lỗi, đọc dưới dạng text an toàn
        const errorText = await response.text()
        alert(`Lỗi từ Server: ${errorText || 'Sai thông tin hoặc tài khoản đã tồn tại!'}`)
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error)
      alert('Không thể kết nối tới Server Spring Boot! Vui lòng kiểm tra lại Backend Java.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] p-3 text-slate-950 sm:p-5 lg:p-8">
      <section className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-310 overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(30,41,59,0.12)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-4rem)]">
        <div className="relative hidden w-[48%] overflow-hidden bg-[#172554] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-28 -top-24 size-95 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-24 size-115 rounded-full border border-white/10" />
          <div className="absolute right-20 top-24 size-3 rounded-full bg-cyan-300" />
          <div className="absolute bottom-28 left-24 size-2 rounded-full bg-indigo-200" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#172554] shadow-lg shadow-blue-950/30">
              <BookOpen className="size-5" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold tracking-tight">EduFlow</span>
          </div>

          <div className="relative z-10 -mt-4">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-cyan-300" />
              Học tập không giới hạn
            </div>
            <h1 className="max-w-md text-4xl font-semibold leading-[1.1] tracking-[-0.04em] xl:text-5xl">
              Hướng đến những tiến bộ mang tính <span className="text-cyan-300">Cá Nhân.</span>
            </h1>
            <p className="mt-6 max-w-sm text-[15px] leading-7 text-blue-100/75">
              Tất cả những gì bạn cần để xây dựng những thói quen tốt hơn, thành thạo những kỹ năng mới và tự tin tiến đến mục tiêu của mình.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['AM', 'JK', 'PS', 'RL'].map((initials, index) => (
                  <div
                    key={initials}
                    className={`flex size-9 items-center justify-center rounded-full border-2 border-[#172554] text-[10px] font-bold ${
                      ['bg-cyan-300 text-cyan-950', 'bg-violet-300 text-violet-950', 'bg-amber-200 text-amber-950', 'bg-rose-300 text-rose-950'][index]
                    }`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-xs leading-5 text-blue-100/70">
                Join <span className="font-semibold text-white">24,000+</span> curious learners
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-blue-100/60">
            <GraduationCap className="size-4" />
            Chương tiếp theo của bạn bắt đầu từ đây.
          </div>
        </div>

        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-[52%] lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-105">
            <div className="mb-9 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#172554] text-white">
                  <BookOpen className="size-5" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-semibold tracking-tight">EduFlow</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Chào mừng trở lại!</p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-[34px]">
                {isSignUp ? 'Hãy bắt đầu hành trình học tập của bạn.' : 'Tiếp tục từ chỗ bạn đã dừng.'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {isSignUp ? 'Tạo tài khoản miễn phí và học theo tốc độ của bạn.' : 'Đăng nhập để tiếp tục học tập với EduFlow.'}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignUp}
                onClick={() => setMode('signin')}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignUp}
                onClick={() => setMode('signup')}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Đăng Ký
              </button>
            </div>

            {/* Gắn sự kiện onSubmit vào Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

              {isSignUp && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Họ và Tên
                    <span className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input 
                        required 
                        name="fullName"
                        type="text" 
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Alex Morgan" 
                        className="auth-input pl-10" 
                      />
                    </span>
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Tên Đăng Nhập
                    <span className="relative">
                      <Users className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input 
                        required 
                        name="username"
                        type="text" 
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="alexmorgan" 
                        className="auth-input pl-10" 
                      />
                    </span>
                  </label>
                </div>
              )}

              {!isSignUp && (
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Tên Đăng Nhập
                  <span className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input 
                      required 
                      name="username"
                      type="text" 
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your username" 
                      className="auth-input pl-10" 
                    />
                  </span>
                </label>
              )}

              {isSignUp && (
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Địa chỉ Email
                  <span className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input 
                      required 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com" 
                      className="auth-input pl-10" 
                    />
                  </span>
                </label>
              )}

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Mật Khẩu
                <span className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    required 
                    name="password"
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••" 
                    className="auth-input px-10" 
                  />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>

              {!isSignUp && (
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input type="checkbox" className="size-3.5 accent-indigo-600" />
                    Ghi nhớ tôi
                  </label>
                  <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Quên Mật Khẩu?</button>
                </div>
              )}

              {isSignUp && (
                <label className="flex items-start gap-2 pt-1 text-xs leading-5 text-slate-500">
                  <input required type="checkbox" className="mt-1 size-3.5 accent-indigo-600" />
                  <span>Tôi đồng ý với <button type="button" className="font-semibold text-indigo-600">Điều khoản Dịch vụ</button> và <button type="button" className="font-semibold text-indigo-600">Chính sách Bảo mật</button>.</span>
                </label>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="group mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#172554] text-sm font-semibold text-white shadow-lg shadow-indigo-950/15 transition-all hover:-translate-y-0.5 hover:bg-[#1e3a8a] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Đăng Ký' : 'Đăng Nhập')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
              
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span>OR</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-100"
                >
                  <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.4Z" />
                    <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.75 9.75 0 0 0 12 21.75Z" />
                    <path fill="#FBBC05" d="M6.54 13.84a5.86 5.86 0 0 1 0-3.68V7.64H3.3a9.75 9.75 0 0 0 0 8.72l3.24-2.52Z" />
                    <path fill="#EA4335" d="M12 6.13c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.39l3.24 2.52C7.31 7.85 9.46 6.13 12 6.13Z" />
                  </svg>
                  <span className="truncate">{isSignUp ? 'Đăng Ký với Google' : 'Đăng Nhập với Google'}</span>
                </button>
                <button
                  type="button"
                  className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-100"
                >
                  <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11 10.13 11.93v-8.43H7.08v-3.5h3.05V9.4c0-3.04 1.79-4.73 4.58-4.73 1.33 0 2.72.24 2.72.24v3.01h-1.53c-1.51 0-1.98.94-1.98 1.9v2.25h3.37l-.54 3.5h-2.83V24C19.61 23.07 24 18.09 24 12.07Z" />
                  </svg>
                  <span className="truncate">{isSignUp ? 'Đăng Ký với Facebook' : 'Đăng Nhập với Facebook'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      </section>
    </main>
  )
}