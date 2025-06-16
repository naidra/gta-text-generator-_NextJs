import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gta font',
  description: 'Gta text generator',
  generator: 'v0.dev',
  // add favicon
  icons: {
    icon: '/images/gta-logo.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

