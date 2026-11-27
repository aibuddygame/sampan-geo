import { notFound } from 'next/navigation'
import { WorkspaceProvider } from '../../components/workspace-provider'
import { locales } from '../../lib/content'
import '../globals.css'

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params
  if (!locales.includes(locale)) notFound()
  return <html lang={locale === 'en' ? 'en' : 'zh-Hant-HK'}>
    <body><WorkspaceProvider key={locale} locale={locale}>{children}</WorkspaceProvider></body>
  </html>
}
