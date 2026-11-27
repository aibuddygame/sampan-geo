'use client'

import { useState } from 'react'
import { copy } from '../lib/content'
import { storyboard } from '../lib/workspace'
import { Icon, Simulation } from './ui'

export function Studio({ locale }) {
  const t = (zh, en) => copy(locale, zh, en)
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState('vertical')
  const [duration, setDuration] = useState('30')
  const [scenes, setScenes] = useState([])
  const [feedback, setFeedback] = useState('')

  function generate(event) {
    event.preventDefault()
    if (!topic.trim()) return
    const preview = storyboard(locale, topic, format, Number(duration))
    setScenes(preview)
    setFeedback(t('已更新劇本及分鏡預覽。', 'Script and storyboard preview updated.'))
  }

  async function copyScript() {
    const text = scenes.map(scene => `${scene.time} · ${scene.title}\n${scene.script}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setFeedback(t('已複製劇本。', 'Script copied.'))
    } catch {
      setFeedback(t('未能使用剪貼簿。可選取分鏡內的文字並手動複製。', 'Clipboard unavailable. Select the script text in the storyboard to copy it manually.'))
    }
  }

  return <div className="studio-grid">
    <div className="panel studio-input">
      <div className="workspace-heading"><span className="icon-tile"><Icon name="video"/></span><div><h2>{t('規劃代言人影片', 'Plan an ambassador video')}</h2><p>{t('以企業 AI 大使為主持，選擇主題及影片格式。', 'Choose a topic and format for a video featuring your Corporate AI Ambassador.')}</p></div></div>
      <form className="field-stack" onSubmit={generate}>
        <label>{t('影片主題', 'Video topic')}<input required maxLength={120} value={topic} onChange={event => setTopic(event.target.value)} placeholder={t('例如：新產品介紹', 'e.g. New product introduction')}/></label>
        <div className="field-pair">
          <label>{t('畫面比例', 'Aspect ratio')}<select value={format} onChange={event => setFormat(event.target.value)}>
            <option value="vertical">{t('直向 9:16', 'Vertical 9:16')}</option><option value="landscape">{t('橫向 16:9', 'Landscape 16:9')}</option>
          </select></label>
          <label>{t('影片長度', 'Duration')}<select value={duration} onChange={event => setDuration(event.target.value)}>
            <option value="30">{t('30 秒', '30 seconds')}</option><option value="60">{t('60 秒', '60 seconds')}</option>
          </select></label>
        </div>
        <button type="submit" className="button button-primary" disabled={!topic.trim()}><Icon name="spark" size={17}/>{t('預覽劇本與分鏡', 'Preview script and storyboard')}</button>
      </form>
    </div>
    <div className="panel studio-preview">
      <div className="workspace-heading"><div><h2>{t('分鏡預覽', 'Storyboard preview')}</h2><p>{t('示例劇本 · 由範本組成', 'Illustrative script · Assembled from templates')}</p></div><Simulation locale={locale}/></div>
      <p className="feedback" role="status">{feedback}</p>
      {scenes.length ? <ol className="scene-list">
        {scenes.map(scene => <li key={scene.title}><span>{scene.time}</span><div><h3>{scene.title}</h3><p>{scene.script}</p><small>{scene.visual}</small></div></li>)}
      </ol> : <div className="studio-empty"><Icon name="video" size={34}/><p>{t('提交影片主題後，這裡會顯示三個示例分鏡。', 'Enter a topic to see three example scenes here.')}</p></div>}
      <div className="actions">
        <button type="button" className="button button-secondary" disabled={!scenes.length} onClick={copyScript}><Icon name="copy" size={16}/>{t('複製劇本', 'Copy script')}</button>
        <button type="button" className="button button-secondary" disabled>{t('影片輸出 · 規劃中', 'Video rendering · Planned')}</button>
      </div>
    </div>
  </div>
}
