import { contact, copy } from './content.js'

const sampleFaqs = [
  ['services', ['你哋提供咩服務？', 'SAMPAN.ai 以企業 AI 大使及企業知識庫為起點，並涵蓋 SEO／GEO／AEO、商務及通訊整合、Mplifier 短片製作和企業 AI 轉型。您可試用文字對話及 FAQ 審批流程。', ['服務', '產品']],
    ['What services do you offer?', 'SAMPAN.ai brings together the Corporate AI Ambassador and Knowledge Hub, plus SEO, GEO and AEO, commerce and messaging, Mplifier short-video production and enterprise AI transformation. Try the text demo or FAQ approval workflow.', ['services', 'products']]],
  ['language', ['有冇廣東話支援？', '此示範提供繁體中文及英文文字。廣東話語音互動屬於產品規劃，仍需測試。', ['廣東話', '粵語', '英文']],
    ['Which languages are supported?', 'This demo offers Traditional Chinese and English text. Cantonese voice interaction is planned and still needs testing.', ['languages', 'cantonese']]],
  ['booking', ['點樣預約示範？', '請前往聯絡頁，電郵 VX Real 並簡介您的公司及希望體驗的場景。', ['預約', '聯絡', '示範']],
    ['How can I book a demo?', 'Use the Contact page to email VX Real with a short description of your business and the scenario you want to explore.', ['book a demo', 'book a demonstration', 'contact']]],
]

export function initialWorkspace(locale) {
  const faqs = sampleFaqs.map(([id, zh, en]) => {
    const [question, answer, aliases] = copy(locale, zh, en)
    return { id, aliases, lastRevision: 1, published: { question, answer, revision: 1 }, draft: null, prior: [] }
  })
  return {
    faqs,
    behaviour: {
      name: 'Sophie',
      greeting: copy(locale, '你好，我係 Sophie。想了解邊方面？', 'Hello, I’m Sophie. What would you like to explore?'),
      tone: 'warm', handover: contact, avatarStyle: 'bloom', voice: 'cantonese', enabled: true,
    },
  }
}

export function saveDraft(faq, { question, answer }) {
  const cleanQuestion = question.trim()
  const cleanAnswer = answer.trim()
  if (!cleanQuestion || !cleanAnswer) return faq
  const revision = faq.lastRevision + 1
  return { ...faq, lastRevision: revision, draft: { question: cleanQuestion, answer: cleanAnswer, revision, status: 'draft' } }
}

export function transitionFaq(faq, action) {
  const { draft, published, prior } = faq
  if (action === 'review' && draft?.status === 'draft') {
    return { ...faq, draft: { ...draft, status: 'review' } }
  }
  if (action === 'approve' && draft?.status === 'review') {
    return { ...faq, draft: { ...draft, status: 'approved' } }
  }
  if (action === 'publish' && draft?.status === 'approved') {
    const { question, answer, revision } = draft
    return { ...faq, draft: null, published: { question, answer, revision }, prior: [published, ...prior] }
  }
  if (action === 'rollback' && prior.length) {
    const previous = prior[0]
    const restoredDraft = draft ?? (previous ? null : { ...published, status: 'draft' })
    return { ...faq, draft: restoredDraft, published: previous, prior: prior.slice(1) }
  }
  return faq
}

function normalize(text) {
  return text.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

export function matchingFaq(faqs, question) {
  const normalized = normalize(question)
  if (!normalized) return undefined
  const entries = faqs.filter(faq => faq.published)
  const exact = entries.find(faq => normalize(faq.published.question) === normalized)
  if (exact) return exact
  const words = ' ' + normalized + ' '
  const matches = entries.filter(faq => faq.aliases.some(alias =>
    /\p{Script=Han}/u.test(alias) ? normalized.includes(alias) : words.includes(' ' + alias + ' ')
  ))
  return matches.length === 1 ? matches[0] : undefined
}

export function answerFor(locale, workspace, question, faqId) {
  const { faqs, behaviour } = workspace
  const match = faqId ? faqs.find(faq => faq.id === faqId && faq.published) : matchingFaq(faqs, question)
  if (!match) return {
    answer: copy(locale, '示範資料沒有可以核實的答案。您可聯絡團隊跟進。', 'I don’t have a verified answer in the sample knowledge. Please contact the team for help.'),
    source: null,
  }
  const lead = behaviour.tone === 'warm' ? copy(locale, '好呀，', 'Happy to help. ') : ''
  return { answer: lead + match.published.answer, source: match.published }
}

export function storyboard(locale, topic, format, duration) {
  const lead = topic.trim()
  const second = Math.round(duration / 4)
  const third = Math.round(duration * 0.72)
  const time = seconds => [Math.floor(seconds / 60), seconds % 60].map(n => String(n).padStart(2, '0')).join(':')
  const layout = format === 'vertical' ? '9:16' : '16:9'
  return [
    { time: `${time(0)} – ${time(second)}`, title: copy(locale, '開場', 'Opening'), visual: copy(locale, `${layout} · 代言人出場及主題標題`, `${layout} · On-camera presenter and topic title`), script: copy(locale, `大家好，今日同大家介紹「${lead}」。`, `Hello. Today I’d like to introduce ${lead}.`) },
    { time: `${time(second)} – ${time(third)}`, title: copy(locale, '重點解說', 'Key message'), visual: copy(locale, '插入已核准的產品畫面或培訓素材', 'Add approved product visuals or training material'), script: copy(locale, `先了解「${lead}」適用於甚麼場景。[加入已核實的例子與資料]`, `Let’s look at where ${lead} is useful. [Add a verified example and supporting detail.]`) },
    { time: `${time(third)} – ${time(duration)}`, title: copy(locale, '下一步', 'Next step'), visual: copy(locale, '品牌標誌及聯絡資訊', 'Brand mark and contact details'), script: copy(locale, '想進一步了解？歡迎聯絡我們的團隊。', 'Want to learn more? Get in touch with our team.') },
  ]
}
