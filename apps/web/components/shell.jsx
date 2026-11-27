'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ambassadorName, contact, copy, linkTo } from '../lib/content'
import { Brand, ButtonLink, Icon } from './ui'

const navigation = [
  ['ambassador', ...ambassadorName],
  ['knowledge-hub', '知識庫', 'Knowledge Hub'],
  ['solutions', '企業方案', 'Solutions'],
  ['video-studio', '影片工作室', 'Video Studio'],
  ['about', '關於我們', 'About'],
]

export function Header({ locale, page }) {
  const [menu, setMenu] = useState(false)
  const otherLocale = locale === 'en' ? 'zh-hant' : 'en'
  return <header className="site-header">
    <div className="shell header-inner">
      <Brand locale={locale}/>
      <nav className="primary-nav" aria-label={copy(locale, '主導覽', 'Main navigation')} id="primary-navigation" data-open={menu}>
        {navigation.map(([target, zh, en]) => <Link key={target} href={linkTo(locale, target)}
          aria-current={target === page ? 'page' : undefined} onClick={() => setMenu(false)}>{copy(locale, zh, en)}</Link>)}
        <Link className="mobile-demo" href={linkTo(locale, 'demo')} onClick={() => setMenu(false)}>{copy(locale, '代言人示範', 'Ambassador demo')}</Link>
      </nav>
      <div className="header-actions">
        <Link className="language-link" href={linkTo(otherLocale, page)} hrefLang={locale === 'en' ? 'zh-Hant-HK' : 'en'} aria-label={copy(locale, '切換至英文', 'Switch to Traditional Chinese')}>
          <Icon name="globe" size={16}/><span lang={locale === 'en' ? 'zh-Hant-HK' : 'en'}>{copy(locale, 'EN', '繁中')}</span>
        </Link>
        <ButtonLink href={linkTo(locale, 'contact')} icon="diagonal">{copy(locale, '預約示範', 'Book a demo')}</ButtonLink>
        <button type="button" className="mobile-menu" aria-controls="primary-navigation" aria-expanded={menu}
          aria-label={menu ? copy(locale, '關閉選單', 'Close menu') : copy(locale, '開啟選單', 'Open menu')}
          onClick={() => setMenu(!menu)}><Icon name={menu ? 'close' : 'menu'} size={22}/></button>
      </div>
    </div>
  </header>
}

export function Footer({ locale }) {
  return <footer className="site-footer">
    <div className="shell footer-inner">
      <div><Brand locale={locale}/><p>{copy(locale, '由 VX Real Limited 開發', 'Developed by VX Real Limited')}</p></div>
      <nav aria-label={copy(locale, '頁尾導覽', 'Footer navigation')}>
        <Link href={linkTo(locale, 'demo')}>{copy(locale, '代言人示範', 'Ambassador demo')}</Link>
        <Link href={linkTo(locale, 'admin')}>{copy(locale, '客戶管理平台', 'Admin portal')}</Link>
        <Link href={linkTo(locale, 'contact')}>{copy(locale, '聯絡我們', 'Contact')}</Link>
      </nav>
      <a href={'mailto:' + contact}>{contact}</a>
    </div>
  </footer>
}
