import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Admin } from '../../../components/admin'
import { Conversation } from '../../../components/demo'
import { About, Ambassador, Contact, Home, Knowledge, PageIntro, Solutions, Video } from '../../../components/marketing'
import { Header, Footer } from '../../../components/shell'
import { Simulation } from '../../../components/ui'
import { copy, linkTo, locales, pages, routeNames, siteOrigin } from '../../../lib/content'

const templates = { home: Home, ambassador: Ambassador, 'knowledge-hub': Knowledge, solutions: Solutions, 'video-studio': Video, about: About, contact: Contact }

export function generateStaticParams() {
  return routeNames.map(page => ({ path: page === 'home' ? [] : [page] }))
}

function resolve({ locale, path = [] }) {
  const page = path[0] || 'home'
  if (!locales.includes(locale) || path.length > 1 || !routeNames.includes(page)) notFound()
  return { locale, page }
}

export async function generateMetadata({ params }) {
  const { locale, page } = resolve(await params)
  const [zhTitle, enTitle, zhDescription, enDescription] = pages[page]
  const title = copy(locale, zhTitle, enTitle) + ' | SAMPAN.ai'
  const description = copy(locale, zhDescription, enDescription)
  const url = siteOrigin + linkTo(locale, page)
  return {
    title, description,
    robots: { index: false, follow: false },
    alternates: page === 'admin' || page === 'demo' ? undefined : { canonical: url },
    openGraph: { title, description, url, siteName: 'SAMPAN.ai', type: 'website', locale: locale === 'en' ? 'en_HK' : 'zh_HK' },
  }
}

export default async function Page({ params }) {
  const { locale, page } = resolve(await params)
  const Template = templates[page]
  return <>
    <a href="#main" className="skip-link">{copy(locale, '跳至主要內容', 'Skip to content')}</a>
    <Header locale={locale} page={page}/>
    <main id="main" tabIndex={-1}>
      {Template && <Template locale={locale}/>}
      {page === 'demo' && <>
        <PageIntro locale={locale} page={page}><Simulation locale={locale}/></PageIntro>
        <section className="shell section-space pt-short"><Conversation locale={locale}/></section>
      </>}
      {page === 'admin' && <>
        <PageIntro locale={locale} page={page}><Simulation locale={locale}/></PageIntro>
        <section className="shell section-space pt-short"><Suspense fallback={<p>{copy(locale, '正在載入工作空間…', 'Loading workspace…')}</p>}><Admin locale={locale}/></Suspense></section>
      </>}
    </main>
    <Footer locale={locale}/>
  </>
}
