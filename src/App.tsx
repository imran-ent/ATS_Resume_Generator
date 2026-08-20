import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { usePrintExport } from '@/hooks/usePrintExport'
import { PrintPortal } from '@/components/resume/print-portal'
import { LandingPage } from '@/pages/landing'
import { BuilderPage } from '@/pages/builder'
import { EditorPage } from '@/pages/editor'
import { DashboardPage } from '@/pages/dashboard'
import { AnalyzePage } from '@/pages/analyze'
import { LoginPage } from '@/pages/login'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function PrintBridge() {
  const printActive = useUiStore((s) => s.printActive)
  const payload = useUiStore((s) => s.printPayload)
  usePrintExport()
  if (!printActive || !payload) return null
  return <PrintPortal data={payload} />
}

export default function App() {
  const refresh = useAuthStore((s) => s.refresh)

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<BuilderPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
      <PrintBridge />
    </div>
  )
}