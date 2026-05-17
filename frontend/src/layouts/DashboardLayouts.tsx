// src/layouts/DashboardLayout.tsx
import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/DashboardComponents/Sidebar"

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Konten halaman ganti-ganti di sini */}
      <main className="ml-64 flex-1 min-h-screen bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
