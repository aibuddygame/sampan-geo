import { copy, linkTo } from '../lib/content'
import {
  agentCapabilities, buyerFaqs, buyerScenarios, deploymentOptions, enterpriseSections,
  exampleConversation, governanceAreas, platformWorkflows, rolloutSteps,
} from '../lib/enterprise-content'
import { ButtonLink, FeatureCards, Icon, SectionHeading, Simulation, TextLink } from './ui'

export function EnterpriseNavigation({ locale }) {
  return <nav className="enterprise-nav" aria-label={copy(locale, '企業版頁面目錄', 'On this enterprise page')}>
    <div className="shell">
      {enterpriseSections.map(([id, zh, en]) => <a key={id} href={'#' + id}>{copy(locale, zh, en)}</a>)}
    </div>
  </nav>
}

export function PlatformWorkflows({ locale }) {
  return <section className="shell section-space enterprise-anchor" id="platform">
    <SectionHeading
      title={copy(locale, '一位品牌代言人，從網站對話延伸至影片', 'One brand ambassador for website conversations and video')}
      description={copy(locale, '以企業知識庫為基礎，管理對外回答的內容、品牌表達及不同渠道的應用。', 'Start with a shared knowledge base. Decide what the avatar can say, how it represents your brand and where you want to use it.')}/>
    <div className="platform-grid">
      {platformWorkflows.map(({ icon, title, description, steps, page, action }) => <article key={page} className="platform-card">
        <span className="icon-tile"><Icon name={icon}/></span>
        <h3>{copy(locale, ...title)}</h3>
        <p>{copy(locale, ...description)}</p>
        <ol>{steps.map(([zh, en]) => <li key={en}>{copy(locale, zh, en)}</li>)}</ol>
        <TextLink href={linkTo(locale, page)}>{copy(locale, ...action)}</TextLink>
      </article>)}
    </div>
  </section>
}

export function AgentCapabilities({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  return <section className="agent-capabilities section-space enterprise-anchor" id="ai-agents">
    <div className="shell">
      <SectionHeading
        title={t('從訪客提問到人工接手', 'From a visitor question to staff handover')}
        description={t('企業 AI 大使結合品牌人像與獲批知識。預約及 CRM 查詢等操作可在另行核准的整合項目評估。', 'The Corporate AI Ambassador brings together a branded avatar and approved knowledge. Booking and CRM actions can be evaluated as separately approved integrations.')}/>
      <div className="agent-detail-grid">
        <figure className="agent-transcript">
          <figcaption>
            <strong>{t('網站培訓查詢', 'Website training enquiry')}</strong>
            <Simulation locale={locale}/>
          </figcaption>
          <dl>
            {exampleConversation.map(([zhRole, enRole, zhLine, enLine]) => <div key={enRole}>
              <dt>{t(zhRole, enRole)}</dt>
              <dd>{t(zhLine, enLine)}</dd>
            </div>)}
          </dl>
          <p className="agent-source"><Icon name="file" size={16}/>{t('示例來源：產品培訓 FAQ', 'Example source: Product training FAQ')}</p>
          <TextLink href={linkTo(locale, 'demo')}>{t('試用文字對話及人工轉介', 'Try text conversation and handover')}</TextLink>
        </figure>
        <div className="agent-capability-list">
          {agentCapabilities.map(({ icon, title, description, status }) => <article key={icon}>
            <span className="icon-tile"><Icon name={icon}/></span>
            <div>
              <div className="agent-capability-heading"><h3>{t(...title)}</h3><span>{t(...status)}</span></div>
              <p>{t(...description)}</p>
            </div>
          </article>)}
        </div>
      </div>
    </div>
  </section>
}

export function EnterpriseScenarios({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  return <section className="workflow-section section-space enterprise-anchor" id="use-cases">
    <div className="shell">
      <SectionHeading eyebrow={t('示例場景', 'ILLUSTRATIVE SCENARIOS')}
        title={t('從團隊每天遇到的問題開始', 'Start with a problem your team sees every day')}
        description={t('選擇一個場景試點，並在擴展前量度表現。', 'Choose one scenario for a pilot and measure how it performs before extending it.')}/>
      <div className="scenario-grid">
        {buyerScenarios.map(({ icon, team, title, example, measure, page }) => <article className="feature-card scenario-card" key={icon}>
          <div className="scenario-team"><span className="icon-tile"><Icon name={icon}/></span>{t(...team)}</div>
          <h3>{t(...title)}</h3>
          <p>{t(...example)}</p>
          <dl><dt>{t('試點量度', 'What to measure')}</dt><dd>{t(...measure)}</dd></dl>
          <TextLink href={linkTo(locale, page)}>{t('了解相關方案', 'Explore the related solution')}</TextLink>
        </article>)}
      </div>
    </div>
  </section>
}

export function GovernanceAndDeployment({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  return <section className="enterprise-trust section-space enterprise-anchor" id="deployment">
    <div className="shell">
      <SectionHeading eyebrow={t('企業治理及技術規劃', 'GOVERNANCE & TECHNICAL PLANNING')}
        title={t('由您的團隊控制資料、內容和上線範圍', 'Keep your team in charge of data, content and deployment')}
        description={t('先與業務、資訊科技及資料負責人談妥試點要求。', 'Agree on pilot requirements with your business, IT and data owners before connecting real systems.')}/>
      <FeatureCards locale={locale} items={governanceAreas}/>
      <div className="deployment-heading">
        <h3>{t('與技術團隊評估的部署選項', 'Deployment options to review with IT')}</h3>
        <TextLink href={linkTo(locale, 'admin?tab=deploy')}>{t('查看網站嵌入示意', 'Preview website embedding')}</TextLink>
      </div>
      <FeatureCards locale={locale} items={deploymentOptions}/>
    </div>
  </section>
}

export function EnterpriseRollout({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  return <section className="shell section-space enterprise-anchor" id="rollout">
    <SectionHeading title={t('由一個試點走向正式導入', 'From a focused pilot to a wider rollout')}
      description={t('先選定一項業務成果，再按整合、用量、部署及支援範圍商議項目。', 'Agree on a business outcome first, then scope the engagement around integration, usage, deployment and support.')}/>
    <ol className="rollout-grid">{rolloutSteps.map(([zh, en, zhText, enText]) => <li key={en}>
      <h3>{t(zh, en)}</h3><p>{t(zhText, enText)}</p>
    </li>)}</ol>
  </section>
}

export function EnterpriseFaq({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  return <section className="workflow-section section-space enterprise-anchor" id="faq">
    <div className="shell enterprise-faq">
      <SectionHeading title={t('常見問題', 'Frequently asked questions')}/>
      <div>{buyerFaqs.map(([zh, en, zhAnswer, enAnswer]) => <details key={en}>
        <summary>{t(zh, en)}<Icon name="plus" size={17}/></summary>
        <p>{t(zhAnswer, enAnswer)}</p>
      </details>)}</div>
    </div>
  </section>
}

export function MplifierSpotlight({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const workflow = [
    ['file', '匯整長片素材', 'Select source material', '以有使用權的訪談、網上研討會或產品直播回放作為來源。', 'Start with rights-cleared interviews, webinars or recorded product sessions.'],
    ['search', '找出值得剪輯的段落', 'Identify moments worth clipping', '評估以逐字稿、時間碼及片段重點組成候選剪輯清單。', 'Evaluate transcripts, timecodes and key moments to build a shortlist of clips.'],
    ['video', '審核直向短片', 'Review vertical edits', '由團隊核對開場、字幕、品牌用語及直向裁切，再決定輸出版本。', 'Have your team review openings, captions, language and vertical framing before deciding what to export.'],
  ]
  return <section className="workflow-section section-space enterprise-anchor" id="mplifier">
    <div className="shell">
      <SectionHeading eyebrow="MPLIFIER" title={t('將既有長片轉化成短片內容', 'Repurpose existing footage into short videos')}
        description={t('Mplifier 是團隊的短片產品方向，適合已有長片素材的品牌及內容團隊。在此網站上可試用 SAMPAN 的劇本與分鏡；Mplifier 剪輯整合另行規劃。', 'Mplifier is our short-video product for brands and content teams with existing footage. Here you can try SAMPAN’s script and storyboard preview. Mplifier editing is a separate integration workstream.')}/>
      <FeatureCards locale={locale} items={workflow}/>
      <div className="mt-6"><ButtonLink href={linkTo(locale, 'contact')} primary={false}>{t('討論 Mplifier 短片方案', 'Discuss Mplifier short-video production')}</ButtonLink></div>
    </div>
  </section>
}

export function ServiceDetails({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const services = [
    {
      id: 'seo-geo',
      title: 'SEO / GEO / AEO',
      description: t('由現有網站建立基準，交付優先改善建議及上線後的量度方法。', 'Establish a baseline for your existing website, then prioritise improvements and agree how to measure them after release.'),
      items: [
        ['search', 'SEO · 傳統搜尋', 'SEO · Search fundamentals', '檢查爬取、索引、網頁標題、網站地圖及內部連結。', 'Review crawlability, indexability, titles, sitemaps and internal links.'],
        ['globe', 'GEO · AI 搜尋可見度', 'GEO · AI search visibility', '規劃在指定搜尋引擎、語言及問題中觀察品牌有否被提及或引用。', 'Plan repeatable observations of brand mentions and citations across selected answer engines, languages and queries.'],
        ['chat', 'AEO · 答案內容', 'AEO · Answer-oriented content', '改善問題與答案的配對、FAQ 結構及資料來源，讓資訊更容易核對。', 'Improve FAQs, answer structure and source clarity so information is easier to verify.'],
      ],
      action: t('討論網站檢查', 'Discuss a website audit'),
    },
    {
      id: 'commerce',
      title: t('AI 商務及通訊整合', 'AI Commerce & Messaging Integration'),
      description: t('以 WhatsApp Business、網店和 CRM 為候選渠道。先界定一個查詢流程，再分階段評估報價及訂單。', 'Scope WhatsApp Business, a store or a CRM around one enquiry workflow first. Evaluate quoting and orders in later phases.'),
      items: [
        ['chat', '統一查詢及轉介', 'Route enquiries consistently', '整理常見查詢、轉介條件及員工接手方式。', 'Agree on recurring enquiries, escalation conditions and staff handover.'],
        ['knowledge', '接駁核准資料', 'Connect approved data', '按場景選擇可讀取的產品目錄及客戶資料欄位。', 'Choose the catalogue and customer fields the workflow is permitted to read.'],
        ['user-check', '保留人工確認', 'Keep staff confirmation', '報價、訂單及付款連結屬後續整合，須驗證權限、確認步驟及例外處理。', 'Quotes, orders and payment links require scoped permissions, confirmation and exception handling in a later integration.'],
      ],
      action: t('討論商務整合', 'Discuss a commerce integration'),
    },
    {
      id: 'transformation',
      title: t('企業 AI 轉型', 'Enterprise AI Transformation'),
      description: t('由一個可量度的業務流程開始，例如文件整理、內部知識支援或跨系統審批。', 'Start with one measurable workflow, such as document handling, internal knowledge support or approvals across systems.'),
      items: [
        ['chart', '找出成本及重工', 'Baseline cost and rework', '量度處理時間、返工率和常見例外，選定可以驗收的第一個環節。', 'Measure processing time, rework and exceptions to choose a first step with clear acceptance criteria.'],
        ['network', '整合現有軟件', 'Integrate existing software', '按需要設計 AI 代理、文件流程或企業 API，與資料負責人確認權限。', 'Design the relevant AI agent, document workflow or API integration with the data owner.'],
        ['shield', '從審批到交接', 'Plan approval and handover', '設定人工審查和退路，以試點成果決定是否擴至其他部門。', 'Set human review and fallback rules, then use pilot results to decide whether to extend to other teams.'],
      ],
      action: t('討論企業 AI 項目', 'Discuss an enterprise AI project'),
    },
  ]
  return services.map(({ id, title, description, items, action }, index) => <section key={id} id={id}
    className={`enterprise-anchor section-space${index % 2 === 0 ? ' workflow-section' : ''}`}>
    <div className="shell">
      <SectionHeading title={title} description={description}/>
      <FeatureCards locale={locale} items={items}/>
      <div className="mt-6"><TextLink href={linkTo(locale, 'contact')}>{action}</TextLink></div>
    </div>
  </section>)
}
