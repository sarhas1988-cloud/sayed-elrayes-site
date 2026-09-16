'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { BookOpen, FileText, Mail, Star, MessageSquare, Calendar, Link2, ShoppingBag, Quote, LogOut, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      if (!supabase) { router.push('/admin/login'); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }
      setEmail(user.email ?? '')
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    if (supabase) await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-ink/50 font-tajawal">جاري التحميل...</p></div>
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-aref text-3xl text-ember mb-1">لوحة التحكم</h1>
            <p className="text-ink/50 font-tajawal text-sm">{email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blood/15 border border-blood/30 text-blood hover:bg-blood/25 transition-colors font-tajawal text-sm">
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { href: '/admin/books',       icon: BookOpen,      label: 'الأعمال',     sub: 'إدارة الكتب والروايات',      color: 'text-ember' },
            { href: '/admin/posts',       icon: FileText,      label: 'المدونة',     sub: 'إنشاء وتحرير المقالات',      color: 'text-gold' },
            { href: '/admin/reviews',     icon: Star,          label: 'التقييمات',   sub: 'اعتماد وإدارة آراء القرّاء', color: 'text-ember' },
            { href: '/admin/events',      icon: Calendar,      label: 'الفعاليات',   sub: 'معارض وحفلات توقيع وندوات', color: 'text-ember' },
            { href: '/admin/contacts',    icon: MessageSquare, label: 'الرسائل',     sub: 'رسائل التواصل من الزوار',    color: 'text-gold' },
            { href: '/admin/quotes',     icon: Quote,         label: 'الاقتباسات',   sub: 'اقتباسات من الروايات',          color: 'text-gold' },
            { href: '/admin/orders',      icon: ShoppingBag,   label: 'الطلبات',     sub: 'مبيعات الكتب الإلكترونية',   color: 'text-emerald-400' },
            { href: '/admin/links',       icon: Link2,         label: 'الروابط',      sub: 'سوشيال ميديا ومتاجر الشراء', color: 'text-gold' },
            { href: '/admin/subscribers', icon: Mail,          label: 'المشتركون',   sub: 'إدارة قائمة البريد',          color: 'text-blood' },
            { href: '/admin/analytics',   icon: BarChart3,     label: 'الإحصائيات',  sub: 'زوار الموقع وأكتر الصفحات',   color: 'text-emerald-400' },
          ].map(({ href, icon: Icon, label, sub, color }) => (
            <Link key={href} href={href}>
              <div className="card-lifted rounded-xl p-6 hover:border-ember/30 transition-colors cursor-pointer group">
                <Icon size={28} className={`${color} mb-4`} />
                <h2 className="font-aref text-xl text-ink mb-1">{label}</h2>
                <p className="text-ink/50 font-tajawal text-xs">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
