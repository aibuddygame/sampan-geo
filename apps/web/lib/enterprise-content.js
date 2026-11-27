export const enterpriseSections = [
  ['platform', '產品平台', 'Platform'],
  ['ai-agents', '代言人功能', 'Ambassador capabilities'],
  ['use-cases', '應用場景', 'Use cases'],
  ['solutions', '六大方案', 'Six solutions'],
  ['deployment', '治理與部署', 'Governance & deployment'],
  ['rollout', '試點與導入', 'Pilot & rollout'],
  ['faq', '常見問題', 'FAQ'],
]

export const platformWorkflows = [
  {
    icon: 'chat',
    title: ['企業 AI 大使', 'Corporate AI Ambassador'],
    description: ['讓您的企業網站有一位可辨認的品牌代表，依據獲批資料回答問題，並把複雜查詢交給同事。先試用文字示範；即時語音是試點評估項目。', 'Give your corporate website a recognisable brand representative. It is designed to answer from approved knowledge and hand complex enquiries to staff. Try the text demo. Real-time speech is for pilot evaluation.'],
    steps: [
      ['整理網站資料、產品介紹及常見問題', 'Prepare website content, product notes and FAQs'],
      ['設定形象、問候、回覆語氣及轉介方式', 'Set appearance, greeting, tone and handover'],
      ['以示例問題測試答案，再評估網站嵌入', 'Test sample answers before evaluating a website embed'],
    ],
    page: 'demo',
    action: ['試用文字問答', 'Try the text demo'],
  },
  {
    icon: 'video',
    title: ['AI 影片與品牌內容', 'AI video and content production'],
    description: ['以獲授權的代言人形象規劃產品示範、培訓和品牌影片。現可預覽劇本及分鏡；已有長片則可了解 Mplifier 的短片製作流程。', 'Plan product demos, training and brand videos with the same approved avatar identity. Try the script and storyboard preview or explore Mplifier for existing long-form footage.'],
    steps: [
      ['由劇本、簡報或已獲授權的素材開始', 'Start with a script, slides or rights-cleared footage'],
      ['預覽分鏡，由團隊核對內容及品牌用語', 'Preview the storyboard and review facts and brand language'],
      ['按渠道規劃直向短片及不同語言版本', 'Plan vertical shorts and language versions for each channel'],
    ],
    page: 'video-studio',
    action: ['試用劇本及分鏡', 'Try scripts and storyboards'],
  },
]

export const buyerScenarios = [
  {
    icon: 'chat',
    team: ['客戶服務', 'Customer support'],
    title: ['在服務頁解答常見查詢', 'Answer a question on the service page'],
    example: ['示例：物流公司讓代言人解釋改期指引；涉及個別訂單時，訪客可轉交客服。', 'Example: a logistics firm explains its rescheduling policy, then refers booking-specific questions to its service team.'],
    measure: ['獲批答案覆蓋率、轉介是否成功', 'Coverage of approved answers and successful handover'],
    page: 'demo',
  },
  {
    icon: 'person',
    team: ['銷售及產品', 'Sales & product'],
    title: ['協助意向客戶比較選項', 'Help buyers understand their options'],
    example: ['示例：設備供應商用獲批規格解說產品差異；特殊配置或報價由銷售跟進。', 'Example: an equipment supplier explains product differences from approved specifications and routes configuration or quote requests to sales.'],
    measure: ['查詢是否獲得足夠資訊、轉介質量', 'Enquiry completion and quality of sales referrals'],
    page: 'ambassador',
  },
  {
    icon: 'knowledge',
    team: ['員工培訓', 'Learning & development'],
    title: ['將入職指引拆成短課節', 'Turn induction material into short lessons'],
    example: ['示例：營運團隊以已審批的簡報規劃入職影片，並用示例問答檢查員工遇到的疑問。', 'Example: an operations team plans induction videos from approved slides and uses sample Q&A to test common questions.'],
    measure: ['內容核對時間、常見問題覆蓋率', 'Review time and coverage of common questions'],
    page: 'video-studio',
  },
  {
    icon: 'video',
    team: ['市場及內容', 'Marketing & content'],
    title: ['將長片延伸為社交短片', 'Turn a long-form recording into social clips'],
    example: ['示例：品牌團隊把網上研討會整理成直向短片，先核對片段重點、字幕及連結。', 'Example: a brand team repurposes a webinar into vertical clips and reviews the message, captions and landing-page links.'],
    measure: ['可用短片數量、審批及製作所需時間', 'Usable clips and time spent on review and production'],
    page: 'video-studio#mplifier',
  },
]

export const governanceAreas = [
  ['shield', '資料範圍與留存', 'Data boundaries and retention', '試點前確認可公開的資料、存取權限、資料流向及留存安排。對外知識須經企業批准。', 'Agree which content can be shared, along with access, data flows and retention before a pilot. Public answers use business-approved information.'],
  ['user-check', '形象、聲音與標示', 'Likeness, voice and disclosure', '驗證肖像及聲音的使用授權，在訪客體驗和合成內容中清楚標示 AI。', 'Verify likeness and voice rights and clearly indicate when an interaction or media asset is AI-generated.'],
  ['lock', '審批與人工接手', 'Approval and staff handover', '企業審批可發布答案、設定轉介規則；正式部署前再界定管理角色、審計及停用流程。', 'Have staff approve answers and set handover rules. Define admin roles, audit requirements and stop controls before production.'],
]

export const deploymentOptions = [
  ['code', '網站嵌入', 'Website embed', '首個試點優先評估獨立 iframe，限制可嵌入網域，並保留文字及聯絡退路。', 'Evaluate an isolated iframe first, with approved embedding domains and a text or contact fallback.'],
  ['network', '企業系統及 API', 'Business systems and APIs', '按場景評估 CRM、知識來源或影片工作流程。先定義權限、資料欄位及需人工核准的操作。', 'Scope CRM, knowledge or video integrations for the use case. Agree permissions, data fields and actions that need staff approval.'],
  ['globe', '託管與專屬環境', 'Managed or dedicated environment', '按資料所在地、安全要求和成本評估託管方式。專屬環境、平台選型及支援範圍須另行驗證。', 'Evaluate hosting against residency, security and cost requirements. Dedicated environments, provider choice and support scope require separate validation.'],
]

export const rolloutSteps = [
  ['確定業務場景', 'Scope the use case', '挑選一個頁面或流程，指定業務負責人、資料來源及成功指標。', 'Choose one page or workflow. Agree on the business owner, source material and success measures.'],
  ['試行及驗收', 'Run a measured pilot', '用員工審核過的問題測試答案、轉介、廣東話及英文表現，再評估延遲及成本。', 'Use staff-reviewed questions to test answer quality, handover, Cantonese and English. Measure latency and operating cost.'],
  ['審查整合', 'Review integration', '與技術及資料負責人核對部署、權限、故障退路及員工支援。', 'Review deployment, permissions, failure handling and staff support with IT and data owners.'],
  ['逐步擴展', 'Extend after sign-off', '驗收後才增加渠道、語言或團隊，按使用量和成效評估下一階段。', 'Add channels, languages or teams after sign-off. Review usage and outcomes before extending the scope.'],
]

export const buyerFaqs = [
  ['SAMPAN.ai 適合甚麼企業？', 'Who is SAMPAN.ai for?', '以香港企業為起點，適合希望改善網站接待、整理企業知識或製作品牌內容的團隊。亦可按需要討論搜尋可見度及系統整合。', 'It is designed around Hong Kong businesses that want to improve website reception, organise approved knowledge or produce brand content. We can also scope search visibility and systems integration.'],
  ['甚麼是企業 AI 大使？', 'What is a Corporate AI Ambassador?', '是企業的數碼品牌代表。產品方向是讓它使用獲批的企業知識接待訪客、解說服務，並在需要時轉交同事。現可試用文字示範。', 'A digital representative for your brand. The planned experience uses approved company knowledge to welcome visitors, explain services and hand off to staff. The current interactive preview uses text.'],
  ['可以用自己的品牌形象和聲音嗎？', 'Can we use our own brand identity and voice?', '可以在試點規劃中選擇獲授權的人像、聲音、服裝和品牌色彩；真人肖像及聲音需要當事人明確授權。', 'The pilot can be scoped around an approved likeness, voice, attire and brand colours. A real person’s likeness or voice requires documented permission.'],
  ['企業 AI 大使可執行哪些操作？', 'What actions can the Corporate AI Ambassador take?', '目前示範模擬問答及人工轉介。新增 CRM 查詢、預約或提交流程前，須驗證連接器、資料權限、參數及確認步驟。', 'The current demo shows text answers and handover. CRM lookup, booking and submissions require a scoped connector, permission checks, validated fields and agreed confirmation steps.'],
  ['它可以看哪些企業資料？', 'Which company information can it use?', '先整理公司介紹、產品、政策和 FAQ，由指定員工檢查及發布。示範只使用示例知識；正式試點需核對公開與內部資料的分隔和存取權限。', 'Start with company facts, products, policies and FAQs that designated staff can review and publish. The preview uses sample knowledge. The pilot must validate public and internal access boundaries.'],
  ['支援廣東話、英文和其他語言嗎？', 'What language support is planned?', '互動示範提供繁體中文及英文文字。廣東話及英文語音是首批測試重點；普通話、多語字幕及影片配音可在後續階段評估。', 'The interactive preview supports Traditional Chinese and English text. Cantonese and English speech are the first evaluation priorities. Mandarin, multilingual captions and dubbing can be assessed later.'],
  ['觀眾能邊看影片邊提問嗎？', 'Can viewers ask questions during a video?', '影片工作室目前提供劇本及分鏡預覽。影片內問答、即時答覆及多語影片輸出屬後續評估項目。', 'The studio preview covers scripts and storyboards. In-player questions, live answers and multilingual video output are candidates for later evaluation.'],
  ['Mplifier 和影片工作室有甚麼分別？', 'How does Mplifier fit with Video Studio?', '影片工作室從主題和劇本規劃新影片。Mplifier 短片產品從已有長片出發，規劃片段選取、字幕和直向剪輯版本。兩者的整合屬後續工作。', 'Video Studio starts with a topic and script for a new video. Mplifier starts from existing long-form footage to plan clip selection, captions and vertical edits. Connecting the two is a future workstream.'],
  ['SEO、GEO 和 AEO 會交付甚麼？', 'What does an SEO, GEO and AEO engagement deliver?', '先記錄網站基準，檢查索引、頁面結構、搜尋意圖和可核實回答，再提出可上線驗收的優先改進清單。搜尋排名及 AI 引用需用實際觀察量度。', 'Start with a baseline audit of indexing, page structure, search intent and answerable content. Receive prioritised improvements and a validation plan. Search rankings and AI citations are measured separately from readiness.'],
  ['可以接駁 CRM、WhatsApp 或內部系統嗎？', 'Can it connect to CRM, WhatsApp or internal tools?', '整合可按項目評估。先釐清資料與操作權限，以樣本測試查詢和轉介，再決定是否擴展至報價、訂單或內部審批。', 'Integrations can be scoped per project. Start by defining data and action permissions, then test enquiries and handover before considering quotes, orders or internal approvals.'],
  ['技術團隊可如何整合？', 'What can our developers evaluate?', '首個場景為網站嵌入與文字退路。按項目評估受限的 API、狀態通知、內部入口及專屬環境，並核對資料流向與可用性。', 'Start with a website embed and text fallback. A pilot can evaluate scoped APIs, event notifications, internal portals and dedicated deployment against its data and availability requirements.'],
  ['如何評估私隱、安全和部署？', 'How do you evaluate privacy, security and deployment?', '試點前確認資料來源、留存、權限、部署選項及人工接手。具體託管地區、保安控制及企業審查須按項目確認。', 'Before a pilot, review information sources, retention, access, deployment and staff handover. Hosting location, security controls and procurement requirements are reviewed for each engagement.'],
  ['收費、支援和正式導入如何安排？', 'How are pricing, support and rollout scoped?', '先以示範會議確定一個場景及驗收標準，再按整合、使用量、部署及支援需求商議試點範圍與報價。', 'Use the demo meeting to agree on one use case and its acceptance criteria. Scope and price the pilot around integration, usage, deployment and support needs.'],
]

export const agentCapabilities = [
  {
    icon: 'knowledge',
    title: ['以獲批知識回答', 'Knowledge-grounded answers'],
    description: ['以核准的產品資料、常見問題與政策作答。答案不足時，先澄清問題或轉介同事。', 'Use approved product facts, FAQs and policies. If the available information is insufficient, ask a clarifying question or refer it to staff.'],
    status: ['文字示範', 'Text demo'],
  },
  {
    icon: 'person',
    title: ['品牌形象及即時語音', 'Branded avatars and real-time speech'],
    description: ['規劃獲授權的形象、聲音、語氣與問候。首個語音試點驗證廣東話與英文、反應延遲及文字退路。', 'Define an approved likeness, voice, tone and greeting. The first speech pilot would validate Cantonese and English, response latency and text fallback.'],
    status: ['試點評估', 'Pilot evaluation'],
  },
  {
    icon: 'network',
    title: ['授權操作與人工確認', 'Connected actions and approval'],
    description: ['可按項目評估 CRM 查閱、預約意向及員工審批。每個操作須明確限制資料及權限，並按需要要求確認。', 'Evaluate CRM lookups, appointment requests or staff approvals per project. Define data access and permissions for each action, with confirmation where required.'],
    status: ['整合規劃', 'Integration planning'],
  },
  {
    icon: 'video',
    title: ['品牌影片與影片內問答', 'Avatar video and in-video Q&A'],
    description: ['先以劇本及分鏡規劃產品和培訓影片。影片內問答、字幕、本地化及多語配音可另行評估。', 'Start with scripts and storyboards for product or training videos. Evaluate in-player Q&A, captions, localisation and multilingual voiceover separately.'],
    status: ['分鏡示範及路線圖', 'Storyboard demo and roadmap'],
  },
]

export const exampleConversation = [
  ['訪客', 'Visitor', '我想替 12 位同事安排產品培訓，可以先了解課程內容嗎？', 'We’re planning product training for 12 colleagues. What would the session cover?'],
  ['企業 AI 大使', 'Corporate AI Ambassador', '課程包括產品設定、日常操作及常見問題。團隊人數與開課日期由培訓同事確認，我可以引導您聯絡他們。', 'The session covers setup, day-to-day use and common issues. Our training team can confirm group size and dates. I can point you to the right contact.'],
]
