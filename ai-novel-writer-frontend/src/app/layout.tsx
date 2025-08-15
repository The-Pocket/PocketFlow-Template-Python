import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { AppProviders } from '@/components/providers/app-providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AI Novel Writer',
  description: 'AI-powered novel writing assistant with real-time collaboration',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1 flex">
              <aside className="hidden w-64 border-r bg-background md:block">
                <Sidebar />
              </aside>
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
