'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ambassadorName, copy, linkTo } from '../lib/content'
import { answerFor } from '../lib/workspace'
import { ButtonLink, Icon, Portrait, Simulation } from './ui'
import { useWorkspace } from './workspace-provider'

export function Conversation({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const { workspace } = useWorkspace()
  const { faqs, behaviour } = workspace
  const [draft, setDraft] = useState('')
  const [turns, setTurns] = useState([])
  const suggestions = faqs.filter(faq => faq.published).slice(0, 4)

  function ask(question, id) {
    const trimmed = question.trim()
    if (!trimmed || !behaviour.enabled) return
    const reply = answerFor(locale, workspace, trimmed, id)
    setTurns(current => [...current.slice(-7), { question: trimmed, ...reply }])
    setDraft('')
  }

  return <div className="demo-grid">
    <div className="demo-portrait">
      <Portrait locale={locale} priority avatarStyle={behaviour.avatarStyle}/>
      <div className="stage-scrim"/>
      <div className="stage-top"><Simulation locale={locale} light/></div>
      <div className="stage-bottom"><div><div className="stage-name">{behaviour.name}</div><div className="stage-role">{t(...ambassadorName)}</div></div></div>
    </div>
    <div className="panel conversation">
      <div className="workspace-heading"><span className="icon-tile"><Icon name="chat"/></span><div>
        <h2>{t('網站訪客文字對話', 'Website visitor conversation')}</h2><p>{t('此示範以已發布的示例 FAQ 回答', 'Scripted replies use published sample FAQs')}</p>
      </div></div>
      <div role="log" aria-label={t('對話記錄', 'Conversation history')} className="chat-log">
        <p className="chat-reply">{behaviour.enabled ? behaviour.greeting : t('此示範代言人已在管理平台停用。您仍可聯絡團隊。', 'This sample ambassador is disabled in the admin portal. You can still contact the team.')}</p>
        {turns.map((turn, index) => <div key={index} className="chat-turn">
          <p className="chat-user">{turn.question}</p><div className="chat-reply">{turn.answer}
            {turn.source ? <small>{t('示例 FAQ', 'Sample FAQ')} · v{turn.source.revision}</small> :
              <a className="text-link" href={'mailto:' + behaviour.handover}>{t('電郵聯絡團隊', 'Email the team')}<Icon name="diagonal" size={13}/></a>}
          </div>
        </div>)}
      </div>
      {behaviour.enabled ? <>
        <div className="suggestions" aria-label={t('示例問題', 'Suggested questions')}>
          {suggestions.map(faq => <button type="button" key={faq.id} onClick={() => ask(faq.published.question, faq.id)}>{faq.published.question}</button>)}
        </div>
        <form className="chat-form" onSubmit={event => { event.preventDefault(); ask(draft) }}>
          <label className="sr-only" htmlFor="demo-question">{t('您的問題', 'Your question')}</label>
          <input id="demo-question" value={draft} onChange={event => setDraft(event.target.value)} maxLength={240} placeholder={t('輸入您的問題…', 'Type your question…')}/>
          <button type="submit" className="button button-primary" disabled={!draft.trim()} aria-label={t('送出問題', 'Send question')}><Icon name="send" size={19}/></button>
        </form>
      </> : <ButtonLink href={'mailto:' + behaviour.handover} icon="mail">{t('聯絡團隊', 'Contact the team')}</ButtonLink>}
      {turns.length > 0 && <button type="button" className="text-button" onClick={() => setTurns([])}>{t('清除對話', 'Clear conversation')}</button>}
    </div>
    <div className="demo-links"><Link className="text-link" href={linkTo(locale, 'admin?tab=knowledge')}>{t('到管理平台試用 FAQ 審批', 'Try approving an FAQ in the admin portal')}<Icon name="diagonal" size={15}/></Link></div>
  </div>
}
