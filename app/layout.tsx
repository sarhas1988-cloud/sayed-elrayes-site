import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PageTransition } from '@/components/page-transition'
import { EventPulse } from '@/components/event-pulse'
import { AdminToast } from '@/components/admin-toast'
import { ScrollToTop } from '@/components/scroll-to-top'
import { SplashScreen } from '@/components/splash-screen'
import { PageTracker } from '@/components/page-tracker'

export const metadata: Metadata = {
  title: 'السيد الريس | كاتب الرعب النفسي والجريمة والأساطير المصرية',
  description: 'استكشف عالم قلادة الشمس — حيث يلتقي الموت بالطقوس، ويُعاد كتابةُ التاريخ من خلف الظلام.',
  metadataBase: new URL('https://sarhas1988-cloud.vercel.app'),
  openGraph: {
    title: 'السيد الريس | كاتب الرعب النفسي والجريمة والأساطير المصرية',
    description: 'صاحب عالم «قلادة الشمس» — حيث يلتقي الموت بالطقوس، ويُعاد كتابةُ التاريخ من خلف الظلام.',
    type: 'website',
    siteName: 'السيد الريس',
    locale: 'ar_AR',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'السيد الريس — كاتب الرعب النفسي والجريمة والأساطير المصرية' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'السيد الريس | كاتب الرعب النفسي والجريمة والأساطير المصرية',
    description: 'صاحب عالم «قلادة الشمس» — حيث يلتقي الموت بالطقوس، ويُعاد كتابةُ التاريخ من خلف الظلام.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = { themeColor: '#1a1510', userScalable: true }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" style={{ backgroundColor: '#1a1510' }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased text-ink font-tajawal">
        <Navbar />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <EventPulse />
        <AdminToast />
        <ScrollToTop />
        <SplashScreen />
        <PageTracker />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
