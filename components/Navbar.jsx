'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useBranding } from '@/hooks/useBranding'
import { useTranslation } from '@/hooks/useTranslation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import TrialBanner from '@/components/TrialBanner'
import { Menu, LogOut, Home, Users, Briefcase, FileText, Settings, BarChart3, Calendar, Map } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, business, signOut } = useAuth()
  const { branding } = useBranding()
  const { t } = useTranslation()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (!user) return null

  return (
    <>
    <nav className="bg-primary text-light shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-accent text-primary p-2 rounded-lg font-bold">
              CF
            </div>
            <span className="text-xl font-bold">{branding.companyName}</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:text-accent transition"
            >
              <Home size={18} />
              <span>{t('nav.dashboard')}</span>
            </Link>
            <Link
              href="/dashboard/clients"
              className="flex items-center gap-2 hover:text-accent transition"
            >
              <Users size={18} />
              <span>{t('nav.clients')}</span>
            </Link>
            <Link
              href="/dashboard/jobs"
              className="flex items-center gap-2 hover:text-accent transition"
            >
              <Briefcase size={18} />
              <span>{t('nav.jobs')}</span>
            </Link>
            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-2 hover:text-accent transition"
            >
              <FileText size={18} />
              <span>{t('nav.invoices')}</span>
            </Link>
            <Link
              href="/dashboard/calendar"
              className="flex items-center gap-2 hover:text-accent transition"
            >
              <Calendar size={18} />
              <span>{t('nav.calendar')}</span>
            </Link>
            <Link
              href="/dashboard/route"
              className="flex items-center gap-2 hover:text-accent transition"
            >
              <Map size={18} />
              <span>{t('nav.route')}</span>
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-2 hover:text-accent transition"
            >
              <BarChart3 size={18} />
              <span>{t('nav.reports')}</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 hover:text-accent transition"
            >
              <Settings size={18} />
              <span>{t('nav.settings')}</span>
            </Link>
          </div>

          {/* User Info + Sign Out */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-sm">
              <p className="font-semibold">{business?.name || branding.companyName}</p>
              <p className="text-xs opacity-75">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-accent text-primary px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              <LogOut size={18} />
              <span>{t('nav.signOut')}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-primary rounded-lg"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden pb-4 border-t border-accent/20">
            <Link
              href="/dashboard"
              className="block py-2 px-4 hover:bg-primary rounded hover:text-accent transition"
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              href="/dashboard/clients"
              className="block py-2 px-4 hover:bg-primary rounded hover:text-accent transition"
            >
              {t('nav.clients')}
            </Link>
            <Link
              href="/dashboard/jobs"
              className="block py-2 px-4 hover:bg-primary rounded hover:text-accent transition"
            >
              {t('nav.jobs')}
            </Link>
            <Link
              href="/dashboard/invoices"
              className="block py-2 px-4 hover:bg-primary rounded hover:text-accent transition"
            >
              {t('nav.invoices')}
            </Link>
            <Link
              href="/dashboard/calendar"
              className="block py-2 px-4 hover:bg-primary rounded hover:text-accent transition"
            >
              {t('nav.calendar')}
            </Link>
            <Link
              href="/dashboard/route"
              className="block py-2 px-4 hover:bg-primary rounded hover:text-accent transition"
            >
              {t('nav.route')}
            </Link>
            <Link
              href="/dashboard/reports"
              className="block py-2 px-4 hover:bg-primary rounded hover:text-accent transition"
            >
              {t('nav.reports')}
            </Link>
            <Link
              href="/dashboard/settings"
              className="block py-2 px-4 hover:bg-primary rounded hover:text-accent transition"
            >
              {t('nav.settings')}
            </Link>
            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
            <button
              onClick={handleSignOut}
              className="w-full mt-4 bg-accent text-primary px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              <span>{t('nav.signOut')}</span>
            </button>
          </div>
        )}
      </div>
    </nav>
    <TrialBanner />
    </>
  )
}
