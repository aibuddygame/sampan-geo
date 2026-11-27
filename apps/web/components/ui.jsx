import Link from 'next/link'
import Image from 'next/image'
import { ambassadorName, copy, linkTo } from '../lib/content'

const paths = {
  arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
  diagonal: <path d="M6 18 18 6M6 6h12v12"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  play: <path d="m8 5 11 7-11 7V5Z"/>,
  person: <><circle cx="12" cy="8" r="3"/><path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M3 8V5h3m12 0h3v3M3 16v3h2m14 0h2v-3"/></>,
  knowledge: <><path d="M12 5v15M3 5a12 12 0 0 1 9 1 12 12 0 0 1 9-1v14a12 12 0 0 0-9 1 12 12 0 0 0-9-1V5Z"/><path d="M6 9h2m8 0h2M6 13h2m8 0h2"/></>,
  wave: <path d="M3 10v4m4-8v12m5-15v18m5-15v12m4-8v4"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4M8 11l2 2 3-4"/></>,
  chat: <><path d="M20 11a7 7 0 0 1-7 7H5l1-3a7 7 0 0 1 5-11h2a7 7 0 0 1 7 7Z"/><path d="M9 10h7m-7 4h4"/></>,
  video: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></>,
  network: <><circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="m11 7-5 9m7-9 5 9M7 18h10"/></>,
  spark: <path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10Z"/>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></>,
  shield: <><path d="m12 3 7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v2"/></>,
  'user-check': <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a4 4 0 0 1 4-4h4m3 3 2 2 5-5"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  sliders: <path d="M4 7h7m4 0h5M4 17h5m4 0h7M11 4v6m2 4v6"/>,
  chart: <path d="M4 4v16h16M8 15v-3m4 3V8m4 7V5"/>,
  code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-2-13-4 16"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  send: <path d="m3 11 18-8-8 18-2-8-8-2Zm8 2 10-10"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  close: <path d="m6 6 12 12m0-12L6 18"/>,
  file: <><path d="M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6m-6 4h6"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
}

export function Icon({ name, size = 20, className = '' }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

export function BrandMark() {
  return <svg aria-hidden="true" width="31" height="31" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="9" fill="currentColor"/>
    <path d="M7 19.8h18l-4.8 4.4h-8.6L7 19.8Zm8.6-12.6v11h-7.5l7.5-11Zm1.8 3.2 6 7.8h-6v-7.8Z" fill="white"/>
  </svg>
}

export function Brand({ locale }) {
  return <Link className="brand" href={linkTo(locale)} aria-label="SAMPAN.ai">
    <BrandMark/><span>SAMPAN<span className="brand-dot">.ai</span></span>
  </Link>
}

export function ButtonLink({ href, children, primary = true, icon = 'arrow' }) {
  const className = `button ${primary ? 'button-primary' : 'button-secondary'}`
  const contents = <>{children}{icon && <Icon name={icon} size={17}/>}</>
  return href.startsWith('/') ? <Link className={className} href={href}>{contents}</Link> : <a className={className} href={href}>{contents}</a>
}

export function TextLink({ href, children }) {
  return <Link className="text-link" href={href}>{children}<Icon name="diagonal" size={15}/></Link>
}

export function Simulation({ locale, light = false }) {
  return <span className={`simulation${light ? ' simulation-light' : ''}`}><span/>{copy(locale, '模擬示範', 'Simulated demo')}</span>
}

export function Eyebrow({ children, icon = 'spark' }) {
  return <div className="eyebrow"><Icon name={icon} size={14}/>{children}</div>
}

export function SectionHeading({ eyebrow, title, description, centered = false }) {
  return <div className={`section-heading${centered ? ' text-center' : ''}`}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>
}

export function Portrait({ locale, priority = false, className = '', avatarStyle = 'bloom' }) {
  return <Image
    src="/brand/ambassador-bloom.webp"
    alt={copy(locale, '企業 AI 大使示範角色 Sophie 的肖像', 'Portrait of Sophie, the fictional Corporate AI Ambassador demo character')}
    width={880} height={1100} unoptimized
    preload={priority}
    className={`portrait portrait-${avatarStyle} ${className}`}
  />
}

export function AvatarStage({ locale, priority = false }) {
  return <div className="avatar-stage">
    <Portrait locale={locale} priority={priority}/>
    <div className="stage-scrim"/>
    <div className="stage-top">
      <span className="stage-label"><Icon name="spark" size={14}/> {copy(locale, '品牌數碼人像', 'BRANDED AI AVATAR')}</span>
      <Simulation locale={locale} light/>
    </div>
    <div className="stage-bottom">
      <div className="min-w-0">
        <div className="stage-name">Sophie</div>
        <div className="stage-role">{copy(locale, ...ambassadorName)}</div>
      </div>
      <Link className="stage-play" href={linkTo(locale, 'demo')} aria-label={copy(locale, '與 Sophie 對話', 'Talk with Sophie')}><Icon name="play" size={21}/></Link>
    </div>
  </div>
}

export function FeatureCards({ locale, items }) {
  return <div className="cards-grid">
    {items.map(([icon, zhTitle, enTitle, zhText, enText]) => <article className="feature-card" key={icon}>
      <span className="icon-tile"><Icon name={icon}/></span>
      <h3>{copy(locale, zhTitle, enTitle)}</h3>
      <p>{copy(locale, zhText, enText)}</p>
    </article>)}
  </div>
}
