export const contact = 'barry.lau@vxreal.com'
export const siteOrigin = 'https://sampan.ai'
export const ambassadorName = ['企業 AI 大使', 'Corporate AI Ambassador']
export const ambassadorTagline = ['您的品牌、您的知識、您的聲音。', 'Your Brand. Your Knowledge. Your Voice.']
export const locales = ['zh-hant', 'en']
export const routeNames = ['home', 'ambassador', 'knowledge-hub', 'solutions', 'video-studio', 'demo', 'admin', 'about', 'contact']

export function copy(locale, chinese, english) {
  return locale === 'en' ? english : chinese
}

export function linkTo(locale, page = 'home') {
  const parts = [locale === 'en' ? 'en' : '', page === 'home' ? '' : page]
  return '/' + parts.filter(Boolean).join('/')
}

export const pages = {
  home: [
    ...ambassadorName,
    '讓品牌專屬的 AI 大使接待網站訪客，根據您核准的企業資料庫回答問題，並在需要時交由同事跟進。您的 AI 大使亦能協助客戶透過 AI 回答認識您的企業、整合 WhatsApp 及其他通訊工具、製作宣傳短片，並將日常業務流程自動化。',
    'Give your business a branded AI avatar that welcomes website visitors, answers questions from your approved company database, and hands enquiries to your team when needed. Your ambassador also helps customers discover your business in AI answers, connects WhatsApp and your other communication tools, creates short promotional videos, and automates everyday workflows.',
  ],
  ambassador: [...ambassadorName, '為企業網站打造一致的品牌接待體驗。由品牌形象、語氣及企業知識入手，再測試訪客問答和人工轉介。', 'Create a recognisable digital representative for your corporate website. Define its look, tone and approved knowledge, then test visitor conversations and staff handover.'],
  'knowledge-hub': ['企業 AI 知識庫', 'Enterprise AI Knowledge Hub', '整理公司資料、產品及常見問題。由團隊測試、審批及發布企業 AI 大使可對外使用的知識。', 'Give your Corporate AI Ambassador a source your team controls. Review and publish the company information, product facts and FAQs it may share with visitors.'],
  solutions: ['企業 AI 方案', 'Enterprise AI Solutions', '以企業 AI 大使及企業 AI 知識庫為起點，再按需求延伸至搜尋曝光、商務通訊、品牌影片及企業流程。', 'Start with the Corporate AI Ambassador and Enterprise AI Knowledge Hub. Extend into search visibility, commerce messaging, video or business workflows as needed.'],
  'video-studio': ['AI 影片工作室', 'AI Video Studio', '以同一位企業 AI 大使的品牌形象規劃產品解說與培訓影片。試用劇本及分鏡，或了解 Mplifier 的長片轉短片流程。', 'Plan product and training videos around the same Corporate AI Ambassador. Try the script and storyboard preview, or explore Mplifier’s long-to-short workflow.'],
  demo: ['企業 AI 大使示範', 'Corporate AI Ambassador Demo', '試用模擬網站對話，看看企業 AI 大使如何根據示例資料回答，並在需要時轉介同事。', 'Try a simulated website conversation. See how the Corporate AI Ambassador uses sample company knowledge and directs visitors to a person when needed.'],
  admin: ['客戶管理平台', 'Customer Admin Portal', '在示範工作空間管理企業 AI 大使的形象、問候、獲批知識與人工轉介方式。', 'Use the sample workspace to manage the Corporate AI Ambassador’s appearance, greeting, approved knowledge and staff handover.'],
  about: ['關於 SAMPAN.ai', 'About SAMPAN.ai', 'VX Real Limited 為香港企業開發 SAMPAN.ai。旗艦產品企業 AI 大使，把品牌形象與獲批知識帶到企業網站。', 'VX Real Limited develops SAMPAN.ai for Hong Kong businesses. Its flagship Corporate AI Ambassador brings a recognisable brand identity and approved knowledge to corporate websites.'],
  contact: ['預約企業 AI 大使示範', 'Request a Corporate AI Ambassador Demo', '與 VX Real Limited 討論網站接待、產品解說或客戶查詢，選擇適合您企業的示範場景。', 'Tell VX Real Limited where a Corporate AI Ambassador could help on your website, from visitor enquiries to product guidance.'],
}

export const solutions = [
  {
    icon: 'person', page: 'ambassador', title: ambassadorName,
    description: ['以品牌專屬 AI 人像接待網站訪客，根據獲批知識解說服務，並在需要時轉介同事。', 'Give your corporate website a recognisable AI avatar designed to welcome visitors, answer from approved knowledge and hand queries to staff.'],
    points: [['品牌形象、聲音及語氣', '獲批知識與人工轉介', '網站嵌入與文字備用'], ['Brand appearance, voice and tone', 'Approved answers and staff handover', 'Website embed and text fallback']],
    status: ['互動原型', 'Interactive prototype'],
  },
  {
    icon: 'knowledge', page: 'knowledge-hub', title: ['企業 AI 知識庫', 'Enterprise AI Knowledge Hub'],
    description: ['集中管理企業資料與 FAQ，讓團隊決定企業 AI 大使可對外分享哪些資訊。', 'Organise company facts and FAQs, and decide what the Corporate AI Ambassador may share with visitors.'],
    points: [['公司資料、產品及 FAQ', '草稿、審批與版本發布', '公開與內部知識分隔規劃'], ['Company information, products and FAQs', 'Drafts, approvals and published versions', 'Planned separation of public and private knowledge']],
    status: ['工作流程原型', 'Workflow prototype'],
  },
  {
    icon: 'search', page: 'solutions#seo-geo', title: ['SEO / GEO / AEO', 'SEO / GEO / AEO'],
    description: ['檢查網站的可索引性、內容結構與搜尋及 AI 答案可見度訊號。', 'Assess indexability, content structure and readiness for search and AI answers.'],
    points: [['技術及內容檢查', '結構化資料檢視', '追蹤已確認的改善項目'], ['Technical and content checks', 'Structured data review', 'Track verified improvements']],
    status: ['另設實驗工具', 'Separate experimental tool'],
  },
  {
    icon: 'chat', page: 'solutions#commerce', title: ['AI 商務及通訊整合', 'AI Commerce & Messaging Integration'],
    description: ['規劃將 WhatsApp Business、網店及 CRM 接入已審批的服務流程。', 'Plan how approved enquiry and sales workflows connect to WhatsApp Business, stores and CRM.'],
    points: [['WhatsApp Business 接入', '產品目錄與查詢', '報價確認及員工接手'], ['WhatsApp Business integration', 'Product catalogue and enquiries', 'Quote confirmation and staff handover']],
    status: ['規劃中', 'Planned'],
  },
  {
    icon: 'video', page: 'video-studio', title: ['AI 影片及內容自動化', 'AI Video & Content Automation'],
    description: ['以企業 AI 大使的形象規劃新影片；透過 Mplifier 探討如何把現有長片轉化為社交短片。', 'Plan new videos around your Corporate AI Ambassador, or explore repurposing existing footage as short clips with Mplifier.'],
    points: [['劇本與分鏡預覽', '品牌範本及多語字幕規劃', 'Mplifier 短片製作規劃'], ['Script and storyboard preview', 'Planned brand templates and multilingual captions', 'Planned Mplifier short-form workflow']],
    status: ['劇本原型', 'Script prototype'],
  },
  {
    icon: 'network', page: 'solutions#transformation', title: ['企業 AI 轉型', 'Enterprise AI Transformation'],
    description: ['從具體業務流程出發，規劃員工可審核的 AI 自動化及系統整合。', 'Scope AI automation and system integrations around measurable workflows and staff review.'],
    points: [['流程盤點及基準量度', '文件或業務系統整合', '人工審核及例外處理'], ['Workflow mapping and baselines', 'Document or business system integration', 'Human review and exception handling']],
    status: ['顧問與項目規劃', 'Advisory and scoping'],
  },
]

export const brandPillars = [
  ['person', '品牌專屬形象', 'A face for your brand', '以獲授權的人像、服裝和品牌色彩，建立一致的數碼身份。', 'Shape a consistent digital identity with approved likeness, attire and brand colours.'],
  ['knowledge', '以企業知識作答', 'Answers from your knowledge', '集中整理資料與常見問題，經團隊審批後供代言人使用。', 'Give your ambassador facts and FAQs that your team can review and approve.'],
  ['wave', '用您的語氣交流', 'Speak in your voice', '為廣東話及英文場景設計問候、回應語氣及人工轉介。', 'Design greetings, tone and handover for Cantonese and English conversations.'],
]

export const enterpriseControls = [
  ['shield', '只使用已發布知識', 'Approved public knowledge', '企業掌握哪些內容可供公開回答。', 'Teams decide which approved material can appear in public answers.'],
  ['lock', '獨立網站嵌入設計', 'Isolated website embedding', '規劃限制代言人對網站及內部系統的存取。', 'The planned embed limits the ambassador’s access to the website and internal systems.'],
  ['user-check', '形象與聲音授權', 'Likeness and voice rights', '企業上線前核對素材的使用許可。', 'Review rights and consent before onboarding a corporate identity.'],
]
