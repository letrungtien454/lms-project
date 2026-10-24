"use client";

import { useState } from "react";
import {
  Settings,
  ShieldAlert,
  Store,
  CreditCard,
  Server,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Check,
  X,
  Loader2,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  // Cấu hình mẫu trên giao diện
  const [settings, setSettings] = useState({
    siteName: "EduFlow LMS",
    supportEmail: "support@eduflow.vn",
    maintenanceMode: false,
    allowRegistration: true,
    autoApproveCourses: false,
    autoApproveTeachers: false,
    platformCommission: 15, // 15% hoa hồng
    minCoursePrice: 50000,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice("");

    // Giả lập lưu cài đặt hệ thống
    setTimeout(() => {
      setSaving(false);
      setNotice("Đã lưu thay đổi cấu hình hệ thống thành công!");
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f] flex items-center gap-2">
              <Settings className="size-6 text-blue-600" /> Cấu hình hệ thống
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Thiết lập quy tắc vận hành, ngưỡng thanh toán và trạng thái dịch vụ nền tảng EduFlow.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>
        </div>

        {notice && (
          <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{notice}</span>
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* --- 1. CẤU HÌNH CHUNG NỀN TẢNG --- */}
          <section className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#17305f] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Store className="size-4 text-blue-600" /> Thông tin & Trạng thái nền tảng
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên hệ thống LMS</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email hỗ trợ hệ thống</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 divide-y divide-slate-100">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-bold text-slate-800">Chế độ bảo trì (Maintenance Mode)</p>
                  <p className="text-[11px] text-slate-400">Tạm thời khóa truy cập của Học viên và Giảng viên để nâng cấp hệ thống.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="font-bold text-slate-800">Mở đăng ký tài khoản mới</p>
                  <p className="text-[11px] text-slate-400">Cho phép người dùng mới tạo tài khoản Học viên trên hệ thống.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* --- 2. QUY TẮC KIỂM DUYỆT & VẬN HÀNH --- */}
          <section className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#17305f] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="size-4 text-blue-600" /> Quy tắc kiểm duyệt nội dung
            </h2>

            <div className="space-y-3 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="font-bold text-slate-800">Tự động duyệt khóa học mới</p>
                  <p className="text-[11px] text-slate-400">Nếu tắt, khóa học do Giảng viên tạo sẽ ở trạng thái Chờ duyệt trước khi phát hành.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoApproveCourses}
                    onChange={(e) => setSettings({ ...settings, autoApproveCourses: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="font-bold text-slate-800">Tự động duyệt yêu cầu Giảng viên</p>
                  <p className="text-[11px] text-slate-400">Nâng quyền tự động khi Học viên gửi hồ sơ đăng ký làm Giảng viên.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoApproveTeachers}
                    onChange={(e) => setSettings({ ...settings, autoApproveTeachers: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* --- 3. QUY TẮC TÀI CHÍNH & HOA HỒNG --- */}
          <section className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#17305f] border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="size-4 text-blue-600" /> Ngưỡng tài chính & Chiết khấu
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tỷ lệ chiết khấu sàn (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.platformCommission}
                  onChange={(e) => setSettings({ ...settings, platformCommission: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-blue-500 focus:bg-white"
                />
                <p className="mt-1 text-[10px] text-slate-400">Phần trăm hệ thống giữ lại trên mỗi giao dịch khóa học thành công.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giá bán khóa học tối thiểu (VND)</label>
                <input
                  type="number"
                  step="10000"
                  value={settings.minCoursePrice}
                  onChange={(e) => setSettings({ ...settings, minCoursePrice: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </section>

          {/* --- 4. TRẠNG THÁI TÍCH HỢP DỊCH VỤ NỀN (READ-ONLY) --- */}
          <section className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#17305f] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Server className="size-4 text-blue-600" /> Trạng thái hạ tầng dịch vụ Backend
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div>
                  <p className="font-bold text-slate-800">PostgreSQL Database</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Đã kết nối ổn định</p>
                </div>
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="size-3.5" />
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div>
                  <p className="font-bold text-slate-800">AI Vector Search (pgvector)</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Sẵn sàng phục vụ</p>
                </div>
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="size-3.5" />
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div>
                  <p className="font-bold text-slate-800">Dịch vụ Lưu trữ File</p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Local Server Storage</p>
                </div>
                <span className="flex size-6 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Check className="size-3.5" />
                </span>
              </div>
            </div>
          </section>

        </form>

      </div>
    </main>
  );
}