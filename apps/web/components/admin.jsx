'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ambassadorName, copy, linkTo } from '../lib/content'
import { ButtonLink, Icon, Portrait, Simulation } from './ui'
import { Studio } from './studio'
import { useWorkspace } from './workspace-provider'

const sections = [
  ['overview', 'grid', '總覽', 'Overview'],
  ['avatar', 'person', ...ambassadorName],
  ['knowledge', 'knowledge', '知識與訓練', 'Knowledge & Training'],
  ['behaviour', 'sliders', '對話設定', 'Behaviour'],
  ['studio', 'video', '影片工作室', 'Video Studio'],
  ['analytics', 'chart', '對話分析', 'Analytics'],
  ['deploy', 'code', '測試及部署', 'Test & Deploy'],
]

function Overview({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const { workspace: { faqs, behaviour } } = useWorkspace()
  const metrics = [
    [t('已發布 FAQ', 'Published FAQs'), faqs.filter(faq => faq.published).length, t('此工作空間', 'In this workspace')],
    [t('待處理草稿', 'Active drafts'), faqs.filter(faq => faq.draft).length, t('包括待審批版本', 'Includes versions in review')],
    [t('示例對話', 'Example conversations'), '48', t('示例數據', 'Sample data')],
  ]
  return <>
    <div className="metric-grid">{metrics.map(([label, value, footer]) => <div className="panel metric" key={label}><p>{label}</p><strong>{value}</strong><small>{footer}</small></div>)}</div>
    <div className="panel admin-panel"><div className="workspace-heading"><span className="icon-tile"><Icon name="person"/></span><div><h3>{behaviour.name}</h3><p>{behaviour.enabled ? t('示範已啟用', 'Demo enabled') : t('示範已停用', 'Demo disabled')}</p></div></div>
      <h3>{t('待補充的知識主題', 'Suggested knowledge gap')}</h3>
      <p>{t('示例：訪客查詢「支援哪些網站平台？」可新增一條 FAQ，並在發布前核對答案。', 'Example: visitors ask “Which website platforms are supported?” Add a FAQ and verify the answer before publishing.')}</p>
      <ButtonLink href={linkTo(locale, 'admin?tab=knowledge')} primary={false}>{t('管理 FAQ', 'Manage FAQs')}</ButtonLink>
    </div>
  </>
}

function AvatarSettings({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const { workspace: { behaviour }, updateBehaviour } = useWorkspace()
  return <div className="panel admin-panel avatar-settings">
    <div className="avatar-settings-image"><Portrait locale={locale} avatarStyle={behaviour.avatarStyle}/></div>
    <div className="field-stack">
      <label>{t('代言人名稱', 'Ambassador name')}<input maxLength={36} value={behaviour.name} onChange={event => updateBehaviour({ name: event.target.value })} onBlur={event => updateBehaviour({ name: event.target.value.trim() || 'Sophie' })}/></label>
      <label>{t('示例外觀', 'Sample appearance')}<select value={behaviour.avatarStyle} onChange={event => updateBehaviour({ avatarStyle: event.target.value })}>
        <option value="bloom">{t('暖光工作室', 'Warm studio')}</option><option value="midnight">{t('深藍工作室', 'Midnight studio')}</option>
      </select></label>
      <label>{t('示例語音設定', 'Sample voice setting')}<select value={behaviour.voice} onChange={event => updateBehaviour({ voice: event.target.value })}>
        <option value="cantonese">{t('香港廣東話', 'Hong Kong Cantonese')}</option><option value="english">{t('英文', 'English')}</option>
      </select></label>
      <p>{t('外觀可在訪客示範預覽。語音設定是示例，語音播放仍在規劃中。', 'Appearance carries into the visitor demo. Voice choices are illustrative. Audio playback is planned.')}</p>
      <ButtonLink href={linkTo(locale, 'demo')} primary={false}>{t('預覽代言人', 'Preview ambassador')}</ButtonLink>
    </div>
  </div>
}

function KnowledgeSettings({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const { workspace: { faqs }, editFaq, moveFaq } = useWorkspace()
  const [edit, setEdit] = useState(null)
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState('')
  const labels = {
    draft: t('草稿', 'Draft'),
    review: t('待審批', 'In review'),
    approved: t('已審批', 'Approved'),
  }

  function begin(faq) {
    const content = faq?.draft || faq?.published
    setEdit({ id: faq?.id, question: content?.question || '', answer: content?.answer || '' })
    setPreview('')
    setMessage('')
  }

  function save(event) {
    event.preventDefault()
    if (!edit.question.trim() || !edit.answer.trim()) return
    editFaq(edit.id, edit)
    setEdit(null)
    setMessage(t('已儲存新草稿。訪客仍會看到已發布的版本。', 'Draft saved. Visitors still receive the published version.'))
  }

  function transition(id, action, feedback) {
    moveFaq(id, action)
    setMessage(feedback)
    setPreview('')
  }

  return <div className="panel admin-panel">
    <div className="workspace-heading flow-title"><div><h3>{t('公開示例 FAQ', 'Public sample FAQs')}</h3><p>{t('草稿 → 審閱 → 審批 → 發布', 'Draft → Review → Approve → Publish')}</p></div>
      <button type="button" className="button button-primary" onClick={() => begin(null)}><Icon name="plus" size={17}/>{t('新增 FAQ', 'Add FAQ')}</button></div>
    <p className="feedback" role="status">{message}</p>
    {edit && <form className="field-stack faq-edit" onSubmit={save}>
      <h4>{edit.id ? t('編輯 FAQ', 'Edit FAQ') : t('新增 FAQ 草稿', 'New FAQ draft')}</h4>
      <label>{t('問題', 'Question')}<input required maxLength={140} value={edit.question} onChange={event => setEdit({ ...edit, question: event.target.value })}/></label>
      <label>{t('答案', 'Answer')}<textarea required maxLength={600} rows={3} value={edit.answer} onChange={event => setEdit({ ...edit, answer: event.target.value })}/></label>
      <div className="actions"><button className="button button-primary" disabled={!edit.question.trim() || !edit.answer.trim()}>{t('儲存草稿', 'Save draft')}</button><button type="button" className="button button-secondary" onClick={() => setEdit(null)}>{t('取消', 'Cancel')}</button></div>
    </form>}
    <div className="faq-list">
      {faqs.map(faq => {
        const { id, draft, published, prior } = faq
        const status = draft?.status
        return <article className="faq-row" key={id}>
          <div className="faq-top"><h4>{published?.question || draft?.question || t('未發布 FAQ', 'Unpublished FAQ')}</h4><div className="faq-badges">
            {published && <span className="mini-status status-0">{t('已發布', 'Published')} v{published.revision}</span>}
            {draft && <span className="mini-status status-1">{labels[status]} v{draft.revision}</span>}
          </div></div>
          {published && <p>{published.answer}</p>}
          <div className="faq-actions">
            <button type="button" className="text-button" onClick={() => begin(faq)}>{t('編輯', 'Edit')}</button>
            {draft && <button type="button" className="text-button" aria-expanded={preview === id} onClick={() => setPreview(preview === id ? '' : id)}>{t('預覽草稿', 'Preview draft')}</button>}
            {status === 'draft' && <button type="button" className="text-button" onClick={() => transition(id, 'review', t('已提交審閱。', 'Submitted for review.'))}>{t('提交審閱', 'Submit for review')}</button>}
            {status === 'review' && <button type="button" className="text-button" onClick={() => transition(id, 'approve', t('已審批此版本。', 'This revision was approved.'))}>{t('審批版本', 'Approve revision')}</button>}
            {status === 'approved' && <button type="button" className="text-button" onClick={() => transition(id, 'publish', t('已模擬發布。訪客示範現可使用此答案。', 'Published in the mockup. This answer is now available in the visitor demo.'))}>{t('發布版本', 'Publish revision')}</button>}
            {prior.length > 0 && <button type="button" className="text-button" onClick={() => transition(id, 'rollback', t('已回復上一個發布狀態。', 'Restored the previous publication state.'))}>{t('回復發布狀態', 'Roll back publication')}</button>}
          </div>
          {draft && preview === id && <div className="draft-preview"><strong>{t('草稿預覽', 'Draft preview')} · v{draft.revision}</strong><p>{draft.question}</p><p>{draft.answer}</p></div>}
        </article>
      })}
    </div>
    <div className="mt-6"><ButtonLink href={linkTo(locale, 'demo')} primary={false}>{t('在訪客示範測試', 'Test in visitor demo')}</ButtonLink></div>
  </div>
}

function Behaviour({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const { workspace: { behaviour }, updateBehaviour } = useWorkspace()
  const [fields, setFields] = useState(behaviour)
  const [saved, setSaved] = useState(false)

  function change(key, value) {
    setFields({ ...fields, [key]: value })
    setSaved(false)
  }

  return <div className="panel admin-panel">
    <form className="field-stack" onSubmit={event => {
      event.preventDefault()
      if (!fields.greeting.trim() || !fields.handover.trim()) return
      updateBehaviour({ greeting: fields.greeting.trim(), tone: fields.tone, handover: fields.handover.trim() })
      setSaved(true)
    }}>
      <label>{t('開場問候', 'Greeting')}<textarea required rows={3} maxLength={200} value={fields.greeting} onChange={event => change('greeting', event.target.value)}/></label>
      <div className="field-pair">
        <label>{t('回覆語氣', 'Answer tone')}<select value={fields.tone} onChange={event => change('tone', event.target.value)}>
          <option value="warm">{t('友善親切', 'Warm')}</option><option value="professional">{t('專業簡潔', 'Professional')}</option>
        </select></label>
        <label>{t('人工轉介電郵', 'Staff handover email')}<input required type="email" maxLength={120} value={fields.handover} onChange={event => change('handover', event.target.value)}/></label>
      </div>
      <div className="draft-preview"><strong>{t('問候預覽', 'Greeting preview')}</strong><p>{fields.greeting}</p></div>
      <div className="actions"><button type="submit" className="button button-primary">{t('儲存設定', 'Save settings')}</button><ButtonLink href={linkTo(locale, 'demo')} primary={false}>{t('在訪客示範測試', 'Test in visitor demo')}</ButtonLink></div>
      <p className="feedback" role="status">{saved && t('已套用至此工作空間的訪客示範。', 'Applied to the visitor demo in this workspace.')}</p>
    </form>
  </div>
}

function Analytics({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const topics = [[t('服務介紹', 'Service information'), 24], [t('語言支援', 'Language support'), 15], [t('預約示範', 'Demo booking'), 9]]
  return <div className="panel admin-panel">
    <div className="workspace-heading"><span className="icon-tile"><Icon name="chart"/></span><div><h3>{t('熱門查詢主題', 'Top enquiry topics')}</h3><p>{t('示例數據 · 沒有收集訪客對話', 'Sample data · Visitor conversations aren’t collected')}</p></div></div>
    <ul className="bar-chart">{topics.map(([label, count]) => <li key={label}><div><span>{label}</span><strong>{count}</strong></div><span aria-hidden="true"><i style={{ width: count / 24 * 100 + '%' }}/></span></li>)}</ul>
    <h3>{t('待補充的知識', 'Knowledge gaps')}</h3><p>{t('示例：網站平台兼容性、上線時間、影片審稿流程。', 'Examples: website platform compatibility, onboarding timeline and video review process.')}</p>
  </div>
}

function Deployment({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const { workspace: { behaviour }, updateBehaviour } = useWorkspace()
  return <div className="panel admin-panel">
    <div className="workspace-heading"><span className="icon-tile"><Icon name="code"/></span><div><h3>{t('網站嵌入概念', 'Website embed concept')}</h3><p>{t('本機示範 · 網站部署屬後續階段。', 'Local demo · Website deployment is a later stage.')}</p></div></div>
    <div className="draft-preview"><strong>{t('規劃中的部署方式', 'Planned deployment')}</strong><p>{t('獨立網域的 iframe，配合核准的來源及範圍受限的工作階段。', 'A separate-origin iframe with approved origins and scoped sessions.')}</p></div>
    <label className="check-field"><input type="checkbox" checked={behaviour.enabled} onChange={event => updateBehaviour({ enabled: event.target.checked })}/>{t('啟用此工作空間的訪客示範', 'Enable the visitor demo in this workspace')}</label>
    <ButtonLink href={linkTo(locale, 'demo')} primary={false}>{t('開啟訪客示範', 'Open visitor demo')}</ButtonLink>
  </div>
}

const views = { overview: Overview, avatar: AvatarSettings, knowledge: KnowledgeSettings, behaviour: Behaviour, studio: Studio, analytics: Analytics, deploy: Deployment }

export function Admin({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const tab = useSearchParams().get('tab')
  const current = sections.find(([key]) => key === tab) || sections[0]
  const [id, , zh, en] = current
  const Panel = views[id]

  return <div className="admin-layout">
    <nav className="admin-nav" aria-label={t('管理平台導覽', 'Admin workspace navigation')}>
      <div className="admin-nav-title"><span className="icon-tile"><Icon name="grid"/></span><div><strong>{t('示範工作空間', 'Demo workspace')}</strong><small>SAMPAN.ai</small></div></div>
      {sections.map(([key, icon, labelZh, labelEn]) => <Link key={key} href={linkTo(locale, key === 'overview' ? 'admin' : 'admin?tab=' + key)}
        aria-current={key === id ? 'page' : undefined} scroll={false}><Icon name={icon} size={18}/>{t(labelZh, labelEn)}</Link>)}
    </nav>
    <div className="admin-content"><div className="admin-heading"><h2>{t(zh, en)}</h2><Simulation locale={locale}/></div><Panel locale={locale}/></div>
  </div>
}
