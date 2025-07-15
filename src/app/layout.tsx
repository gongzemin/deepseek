import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './prism.css'
import { ClerkProvider } from '@clerk/nextjs'
import { AppContextProvider } from '@/context/AppContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '1DeepSeek - 探索未至之境',
  description:
    'DeepSeek 是一个探索未知领域的工具，旨在帮助用户发现和理解新知识。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="zh-CN">
          <body className={`${inter.className} antialiased`}>
            <Toaster
              toastOptions={{
                success: {
                  style: {
                    background: '#4caf50',
                    color: '#fff',
                  },
                },
                error: {
                  style: {
                    background: '#f44336',
                    color: '#fff',
                  },
                },
              }}
            />
            {children}
          </body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  )
}
