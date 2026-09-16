'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('sr_sid')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('sr_sid', id)
  }
  return id
}

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return

    const supabase = createClient()
    if (!supabase) return

    supabase.from('page_views').insert({
      path: pathname,
      referrer: document.referrer || null,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
    }).then(() => {})
  }, [pathname])

  return null
}
