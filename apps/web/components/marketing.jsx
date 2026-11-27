import { ambassadorName, ambassadorTagline, brandPillars, contact, copy, enterpriseControls, linkTo, pages, solutions } from '../lib/content'
import { AvatarStage, ButtonLink, Eyebrow, FeatureCards, Icon, Portrait, SectionHeading, Simulation, TextLink } from './ui'
import { Studio } from './studio'
import {
  AgentCapabilities, EnterpriseFaq, EnterpriseNavigation, EnterpriseRollout, EnterpriseScenarios,
  GovernanceAndDeployment, MplifierSpotlight, PlatformWorkflows, ServiceDetails,
} from './enterprise'

export function PageIntro({ locale, page, eyebrow, children }) {
  const [zh, en, zhText, enText] = pages[page]
  return <section className="page-intro">
    <div className="shell">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1>{copy(locale, zh, en)}</h1>
      <p>{copy(locale, zhText, enText)}</p>
      {children && <div className="actions">{children}</div>}
    </div>
  </section>
}

export function FinalCta({ locale }) {
  return <section className="shell final-cta">
    <div className="final-cta-inner">
      <div>
        <h2>{copy(locale, '看看企業 AI 大使如何配合您的網站。', 'See how a Corporate AI Ambassador could fit your website.')}</h2>
        <p>{copy(locale, '帶同一個業務場景，與 VX Real 探討示範、試點範圍及驗收方式。', 'Bring one business use case to VX Real. We can discuss what to demonstrate, how to scope the pilot and what to measure.')}</p>
      </div>
      <ButtonLink href={linkTo(locale, 'contact')} icon="diagonal">{copy(locale, '預約示範', 'Book a demo')}</ButtonLink>
    </div>
  </section>
}

function SolutionGrid({ locale, detail = false }) {
  return <div className={`solution-grid ${detail ? 'solution-grid-detail' : ''}`}>
    {solutions.map(({ icon, page, title, description, points, status }) => <article className="solution-card" key={icon}>
      <div className="solution-top"><span className="icon-tile"><Icon name={icon}/></span><span className="solution-status">{copy(locale, ...status)}</span></div>
      <h3>{copy(locale, ...title)}</h3>
      <p>{copy(locale, ...description)}</p>
      {detail && <ul>{copy(locale, ...points).map(point => <li key={point}><Icon name="check" size={16}/>{point}</li>)}</ul>}
      <TextLink href={linkTo(locale, page)}>{copy(locale, '探索方案', 'Explore solution')}</TextLink>
    </article>)}
  </div>
}

function KnowledgeIllustration({ locale }) {
  const statuses = [
    ['file', '公司及服務介紹', 'Company & services', '已發布', 'Published'],
    ['chat', '客戶常見問題', 'Customer FAQs', '待審批', 'In review'],
    ['shield', '網站接待指引', 'Website reception policy', '草稿', 'Draft'],
  ]
  return <div className="knowledge-visual" aria-label={copy(locale, '知識審批工作流程示例', 'Example knowledge approval workflow')}>
    <div className="visual-window">
      <div className="window-title"><span className="icon-tile"><Icon name="knowledge"/></span><strong>{copy(locale, '公開知識庫', 'Public knowledge')}</strong><Simulation locale={locale}/></div>
      {statuses.map(([icon, zh, en, zhStatus, enStatus], i) => <div className="visual-row" key={icon}><Icon name={icon} size={17}/><span>{copy(locale, zh, en)}</span><span className={`mini-status status-${i}`}>{copy(locale, zhStatus, enStatus)}</span></div>)}
    </div>
  </div>
}

function VideoIllustration({ locale }) {
  return <div className="video-visual">
    <div className="video-frame"><Portrait locale={locale}/><span className="video-screen-label"><Icon name="video" size={16}/>{copy(locale, '分鏡預覽', 'Storyboard preview')}</span></div>
    <div className="video-timeline" aria-hidden="true"><i/><i/><i/></div>
  </div>
}

export function Home({ locale }) {
  return <>
    <section className="home-hero enterprise-hero">
      <div className="shell hero-grid">
        <div className="hero-copy">
          <Eyebrow>{copy(locale, '企業 AI 平台', 'ENTERPRISE AI PLATFORM')}</Eyebrow>
          <h1>{copy(locale, ...ambassadorName)}</h1>
          <p className="hero-description">{copy(locale, ...pages.home.slice(2))}</p>
          <p className="tagline">{copy(locale, ...ambassadorTagline)}</p>
          <div className="actions">
            <ButtonLink href={linkTo(locale, 'contact')}>{copy(locale, '預約企業示範', 'Request an enterprise demo')}</ButtonLink>
            <ButtonLink href={linkTo(locale, 'demo')} primary={false} icon="play">{copy(locale, '試用網站對話示範', 'Try the website conversation')}</ButtonLink>
          </div>
        </div>
        <div className="hero-visual"><AvatarStage locale={locale} priority/></div>
      </div>
      <div className="shell">
        <div className="hero-rail">
          <div><Icon name="person" size={19}/>{copy(locale, '企業網站接待', 'Website visitor assistance')}</div>
          <div><Icon name="shield" size={19}/>{copy(locale, '團隊審批企業知識', 'Team-approved knowledge')}</div>
          <div><Icon name="globe" size={19}/>{copy(locale, '人工轉介與接手', 'Staff handover')}</div>
        </div>
      </div>
    </section>

    <EnterpriseNavigation locale={locale}/>
    <PlatformWorkflows locale={locale}/>
    <AgentCapabilities locale={locale}/>
    <EnterpriseScenarios locale={locale}/>

    <section className="shell section-space split-feature">
      <KnowledgeIllustration locale={locale}/>
      <div><SectionHeading eyebrow={copy(locale, '企業 AI 知識庫', 'ENTERPRISE AI KNOWLEDGE HUB')} title={copy(locale, '企業知識，由您掌握。', 'Your company knowledge, under your control.')}
        description={copy(locale, '整理公司資料、FAQ 及服務資訊。由團隊測試、審批及發布企業 AI 大使可對外分享的內容。', 'Your team decides what the Corporate AI Ambassador can share. Organise company information, test answers and publish approved updates.')}/>
        <TextLink href={linkTo(locale, 'knowledge-hub')}>{copy(locale, '探索企業知識庫', 'Explore the Knowledge Hub')}</TextLink></div>
    </section>

    <section className="shell section-space split-feature split-reverse">
      <div><SectionHeading eyebrow={copy(locale, 'AI 影片工作室', 'AI VIDEO STUDIO')} title={copy(locale, '讓同一位代言人成為影片主持。', 'Bring your website ambassador to video.')}
        description={copy(locale, '以企業 AI 大使的獲授權形象規劃產品解說、宣傳或培訓影片。先預覽劇本與分鏡。', 'Use the same approved Corporate AI Ambassador identity to plan product explainers, campaigns or training. Start with a script and storyboard preview.')}/>
        <div className="actions">
          <TextLink href={linkTo(locale, 'video-studio')}>{copy(locale, '體驗影片工作室', 'Explore Video Studio')}</TextLink>
          <TextLink href={linkTo(locale, 'video-studio#mplifier')}>{copy(locale, 'Mplifier 短片產品', 'Mplifier short-video product')}</TextLink>
        </div></div>
      <VideoIllustration locale={locale}/>
    </section>

    <section className="workflow-section section-space enterprise-anchor" id="solutions">
      <div className="shell"><SectionHeading title={copy(locale, '六大企業 AI 方案', 'Six enterprise AI solutions')}
        description={copy(locale, '從企業 AI 大使與企業 AI 知識庫出發，再按需求延伸至搜尋曝光、商務通訊、短片製作與企業流程。', 'Start with the Corporate AI Ambassador and Enterprise AI Knowledge Hub, then extend into discovery, commerce, short-video production and enterprise workflows.')}/>
        <SolutionGrid locale={locale}/>
      </div>
    </section>
    <GovernanceAndDeployment locale={locale}/>
    <EnterpriseRollout locale={locale}/>
    <EnterpriseFaq locale={locale}/>
    <FinalCta locale={locale}/>
  </>
}

export function Ambassador({ locale }) {
  return <>
    <section className="home-hero detail-hero">
      <div className="shell hero-grid">
        <div className="hero-copy">
          <Eyebrow>{copy(locale, '品牌數碼人像', 'BRANDED DIGITAL HUMAN')}</Eyebrow>
          <h1>{copy(locale, ...ambassadorName)}</h1>
          <p className="hero-description">{copy(locale, ...pages.ambassador.slice(2))}</p>
          <div className="actions">
            <ButtonLink href={linkTo(locale, 'demo')} icon="play">{copy(locale, '試用網站對話示範', 'Try the website conversation')}</ButtonLink>
            <ButtonLink href={linkTo(locale, 'knowledge-hub')} primary={false}>{copy(locale, '了解知識審批', 'See how knowledge is approved')}</ButtonLink>
          </div>
        </div>
        <AvatarStage locale={locale} priority/>
      </div>
    </section>
    <section className="shell section-space"><SectionHeading title={copy(locale, '為您的品牌度身設計。', 'An identity designed for your brand.')}/><FeatureCards locale={locale} items={brandPillars}/></section>
    <section className="workflow-section section-space"><div className="shell split-feature">
      <div><SectionHeading title={copy(locale, '讓代言人出現在訪客需要協助的頁面。', 'Place your ambassador where visitors need help.')}
        description={copy(locale, '可先選擇產品頁、服務頁或聯絡頁試點。網站嵌入、廣東話與英文即時語音及文字備用是試點評估項目，現可先試用文字問答及人工轉介示範。', 'Choose a product, service or contact page to pilot. Evaluate an isolated website embed, real-time Cantonese and English, and a text fallback. You can already preview scripted text Q&A and staff handover.')}/>
        <TextLink href={linkTo(locale, 'admin')}>{copy(locale, '查看客戶管理平台', 'Explore the admin workspace')}</TextLink></div>
      <div className="embed-visual">
        <div className="embed-window"><div className="embed-chrome"><i/><i/><i/><span>{copy(locale, '客戶網站示意', 'Example company website')}</span></div>
          <div className="embed-placeholder"><span/><span/><span/></div>
          <div className="embed-widget"><Portrait locale={locale}/><div><strong>Sophie</strong><p>{copy(locale, '你好，有甚麼可以幫到您？', 'Hello, how can I help?')}</p></div></div>
        </div>
      </div>
    </div></section>
    <section className="shell section-space"><SectionHeading title={copy(locale, '管理、審批及延伸應用', 'Manage, approve and reuse')}/>
      <FeatureCards locale={locale} items={enterpriseControls}/>
      <div className="mt-7"><TextLink href={linkTo(locale, 'video-studio')}>{copy(locale, '以同一代言人規劃影片', 'Plan a video with the same ambassador')}</TextLink></div>
    </section>
    <FinalCta locale={locale}/>
  </>
}

export function Knowledge({ locale }) {
  const governance = [
    ['file', '整理企業資料', 'Organise company information', '從公司簡介、產品政策及 FAQ 開始，建立可供員工審核的知識。', 'Start with your company profile, product policies and FAQs that staff can verify.'],
    ['shield', '核對及測試', 'Review and test', '預覽草稿答案，核對原文及適用範圍，再批准對外使用。', 'Preview draft answers and verify source material and scope before approval.'],
    ['check', '發布及回復版本', 'Publish and roll back', '模擬只將已批准的版本提供給訪客，並可回復上一版。', 'Simulate releasing approved versions to visitors and restoring an earlier revision.'],
  ]
  return <>
    <PageIntro locale={locale} page="knowledge-hub">
      <ButtonLink href={linkTo(locale, 'admin?tab=knowledge')}>{copy(locale, '試用 FAQ 審批', 'Try FAQ approval')}</ButtonLink>
    </PageIntro>
    <section className="shell section-space split-feature">
      <KnowledgeIllustration locale={locale}/>
      <div><SectionHeading title={copy(locale, '從資料審批到網站回答。', 'From approved knowledge to website answers.')}
        description={copy(locale, '示範工作空間可編輯 FAQ、預覽草稿、審批及發布。發布後，再到互動示範查看代言人的回答。', 'Edit sample FAQs, preview drafts, approve and publish in the demo workspace. Then check the ambassador’s answer in the interactive demo.')}/>
        <TextLink href={linkTo(locale, 'demo')}>{copy(locale, '查看訪客問答', 'See visitor Q&A')}</TextLink></div>
    </section>
    <section className="workflow-section section-space"><div className="shell"><SectionHeading title={copy(locale, '從草稿到公開答覆。', 'From draft to public answer.')}/><FeatureCards locale={locale} items={governance}/></div></section>
    <FinalCta locale={locale}/>
  </>
}

export function Solutions({ locale }) {
  return <><PageIntro locale={locale} page="solutions"/><section className="shell section-space pt-short">
    <h2 className="sr-only">{copy(locale, '六大方案', 'Six solutions')}</h2><SolutionGrid locale={locale} detail/>
  </section><ServiceDetails locale={locale}/><FinalCta locale={locale}/></>
}

export function Video({ locale }) {
  return <>
    <PageIntro locale={locale} page="video-studio"><Simulation locale={locale}/></PageIntro>
    <section className="shell section-space pt-short"><Studio locale={locale}/></section>
    <MplifierSpotlight locale={locale}/>
    <section className="shell section-space split-feature">
      <VideoIllustration locale={locale}/>
      <div><SectionHeading title={copy(locale, '重用企業 AI 大使的品牌形象。', 'Reuse your approved Corporate AI Ambassador identity.')}
        description={copy(locale, '團隊可先以劇本及分鏡規劃產品介紹與企業培訓。製作流程規劃包括人工審稿、字幕、影片輸出及 Mplifier 短片整合。', 'Plan product explainers and staff learning using scripts and storyboards. The planned production workflow includes human review, captions, video export and Mplifier integration.')}/>
        <TextLink href={linkTo(locale, 'ambassador')}>{copy(locale, '認識企業 AI 大使', 'Meet the Corporate AI Ambassador')}</TextLink></div>
    </section>
    <FinalCta locale={locale}/>
  </>
}

export function About({ locale }) {
  return <>
    <PageIntro locale={locale} page="about"><ButtonLink href={linkTo(locale, 'contact')}>{copy(locale, '與我們聯絡', 'Get in touch')}</ButtonLink></PageIntro>
    <section className="shell section-space split-feature"><div>
      <SectionHeading eyebrow="VX REAL LIMITED" title={copy(locale, '為香港企業開發 AI 應用。', 'Enterprise AI for Hong Kong businesses.')}
        description={copy(locale, '我們先為香港企業的網站接待設計企業 AI 大使，再由企業 AI 知識庫管理回答內容，並探索影片及其他渠道的應用。', 'We are starting with the Corporate AI Ambassador for corporate websites in Hong Kong. The Enterprise AI Knowledge Hub gives teams control over answers and provides a foundation for video and other channels.')}/>
      <TextLink href={linkTo(locale, 'solutions')}>{copy(locale, '查看企業方案', 'View enterprise solutions')}</TextLink>
    </div><div className="about-card">
      <span className="icon-tile"><Icon name="spark"/></span><h2>VX Real Limited</h2>
      <a href="https://vxreal.com/" className="text-link">vxreal.com <Icon name="diagonal" size={15}/></a>
    </div></section><FinalCta locale={locale}/>
  </>
}

export function Contact({ locale }) {
  const subject = encodeURIComponent(copy(locale, 'SAMPAN.ai 企業 AI 大使示範查詢', 'SAMPAN.ai Corporate AI Ambassador demo enquiry'))
  const body = encodeURIComponent(copy(locale, '您好，我想預約 SAMPAN.ai 企業 AI 大使示範。\n\n公司名稱：\n網站：\n希望探討的應用：\n', 'Hello, I would like to arrange a SAMPAN.ai Corporate AI Ambassador demo.\n\nCompany name:\nWebsite:\nUse case to discuss:\n'))
  return <>
    <PageIntro locale={locale} page="contact"/>
    <section className="shell section-space pt-short">
      <div className="contact-panel">
        <span className="icon-tile"><Icon name="mail"/></span>
        <h2>{copy(locale, '與 VX Real 討論您的應用。', 'Talk to VX Real about your use case.')}</h2>
        <p>{copy(locale, '請提供公司名稱、網站、希望解決的問題，以及可能涉及的資料或系統。我們可在示範會議討論試點範圍。按鈕會開啟電郵草稿，供您檢視及寄出。', 'Share your company, website, the problem to solve and any systems or data involved. We can scope a pilot during the demo meeting. The button opens an email draft for you to review and send.')}</p>
        <div className="actions"><ButtonLink href={`mailto:${contact}?subject=${subject}&body=${body}`} icon="mail">{copy(locale, '撰寫預約電郵', 'Compose a demo enquiry')}</ButtonLink><a className="link-email" href={'mailto:' + contact}>{contact}</a></div>
      </div>
    </section>
  </>
}
