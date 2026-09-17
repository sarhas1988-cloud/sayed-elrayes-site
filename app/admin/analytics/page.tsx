'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowRight, Eye, Users, UserRound, CalendarDays, FileText, ExternalLink } from 'lucide-react'

interface Summary {
  total_views: number
  visits: number
  unique_visitors: number
  views_today: number
}

interface TopPage {
  path: string
  views: number
}

interface TopReferrer {
  referrer: string
  views: number
}

const DAYS_BACK = 30

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [topPages, setTopPages] = useState<TopPage[]>([])
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      if (!supabase) { router.push('/admin/login'); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }

      const [{ data: summaryData }, { data: pagesData }, { data: referrersData }] = await Promise.all([
        supabase.rpc('get_analytics_summary', { days_back: DAYS_BACK }),
        supabase.rpc('get_top_pages', { days_back: DAYS_BACK, limit_count: 10 }),
        supabase.rpc('get_top_referrers', { days_back: DAYS_BACK, limit_count: 5 }),
      ])

      setSummary((summaryData?.[0] as Summary) ?? { total_views: 0, visits: 0, unique_visitors: 0, views_today: 0 })
      setTopPages((pagesData as TopPage[]) ?? [])
      setTopReferrers((referrersData as TopReferrer[]) ?? [])
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-ink/50 font-tajawal">جاري التحميل...</p></div>
  }

  const cards = [
    { label: 'زيارات اليوم', value: summary?.views_today ?? 0, icon: CalendarDays, color: 'text-ember' },
    { label: 'الزيارات (Sessions)', value: summary?.visits ?? 0, icon: Users, color: 'text-gold' },
    { label: 'زوار مختلفون', value: summary?.unique_visitors ?? 0, icon: UserRound, color: 'text-gold' },
    { label: 'مشاهدات الصفحات', value: summary?.total_views ?? 0, icon: Eye, color: 'text-ember' },
  ]

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/dashboard" className="text-gold hover:text-ember text-sm font-tajawal flex items-center gap-1 mb-2">
          <ArrowRight size={14} /> العودة
        </Link>
        <h1 className="font-aref text-3xl text-ember mb-1">إحصائيات الزيارات</h1>
        <p className="text-ink/50 font-tajawal text-sm mb-1">آخر {DAYS_BACK} يوم</p>
        <p className="text-ink/30 font-tajawal text-xs mb-8">الزيارة = تصفّح متواصل من نفس الشخص (فاصل أقل من 30 دقيقة). مشاهدات الصفحات = كل صفحة اتفتحت.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card-lifted rounded-xl p-6">
              <Icon size={24} className={`${color} mb-3`} />
              <p className="font-aref text-2xl text-ink mb-1">{value.toLocaleString('ar-EG')}</p>
              <p className="text-ink/50 font-tajawal text-xs">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-lifted rounded-xl p-6">
            <h2 className="font-aref text-xl text-ink mb-4 flex items-center gap-2">
              <FileText size={18} className="text-gold" /> أكتر الصفحات زيارة
            </h2>
            {topPages.length === 0 ? (
              <p className="text-ink/40 font-tajawal text-sm">لا توجد بيانات بعد</p>
            ) : (
              <div className="space-y-2">
                {topPages.map((p) => (
                  <div key={p.path} className="flex items-center justify-between gap-3 py-2 border-b border-ink/10 last:border-0">
                    <span className="text-ink/80 font-tajawal text-sm truncate">{p.path}</span>
                    <span className="text-ember font-tajawal text-sm font-semibold shrink-0">{p.views.toLocaleString('ar-EG')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-lifted rounded-xl p-6">
            <h2 className="font-aref text-xl text-ink mb-4 flex items-center gap-2">
              <ExternalLink size={18} className="text-gold" /> مصدر الزيارات
            </h2>
            {topReferrers.length === 0 ? (
              <p className="text-ink/40 font-tajawal text-sm">لا توجد بيانات بعد</p>
            ) : (
              <div className="space-y-2">
                {topReferrers.map((r) => (
                  <div key={r.referrer} className="flex items-center justify-between gap-3 py-2 border-b border-ink/10 last:border-0">
                    <span className="text-ink/80 font-tajawal text-sm truncate">{r.referrer}</span>
                    <span className="text-ember font-tajawal text-sm font-semibold shrink-0">{r.views.toLocaleString('ar-EG')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
