import test from 'node:test'
import assert from 'node:assert/strict'
import { answerFor, initialWorkspace, matchingFaq, saveDraft, storyboard, transitionFaq } from './workspace.js'

test('draft and approved revisions stay private until published, and rollback restores the original answer', () => {
  const workspace = initialWorkspace('en')
  const original = workspace.faqs[0]
  const input = { question: original.published.question, answer: 'An updated service answer' }
  let faq = saveDraft(original, input)
  const publicAnswer = () => answerFor('en', { ...workspace, faqs: [faq] }, input.question)
  assert.equal(transitionFaq(faq, 'publish'), faq)
  assert.equal(publicAnswer().source.revision, 1)
  faq = transitionFaq(faq, 'review')
  faq = transitionFaq(faq, 'approve')
  assert.equal(publicAnswer().source.revision, 1)
  faq = transitionFaq(faq, 'publish')
  assert.equal(publicAnswer().source.revision, 2)
  assert.match(publicAnswer().answer, /An updated service answer/)
  faq = transitionFaq(faq, 'rollback')
  assert.equal(publicAnswer().source.answer, original.published.answer)
  assert.equal(saveDraft(faq, input).draft.revision, 3)
})

test('editing an approved draft requires reviewing the new revision again', () => {
  const [faq] = initialWorkspace('zh-hant').faqs
  const input = { question: faq.published.question, answer: '新的示例答案' }
  const approved = transitionFaq(transitionFaq(saveDraft(faq, input), 'review'), 'approve')
  const edited = saveDraft(approved, { ...input, answer: '再更新的答案' })
  assert.equal(edited.draft.status, 'draft')
  assert.equal(edited.draft.revision, 3)
  assert.equal(transitionFaq(edited, 'publish'), edited)
})

test('a newly published FAQ can be rolled back to private', () => {
  const input = { question: 'Which browsers?', answer: 'Sample desktop browsers.' }
  let faq = saveDraft({ id: 'new', aliases: [], lastRevision: 0, published: null, prior: [] }, input)
  assert.equal(matchingFaq([faq], input.question), undefined)
  for (const action of ['review', 'approve', 'publish']) faq = transitionFaq(faq, action)
  assert.equal(matchingFaq([faq], input.question).published.answer, input.answer)
  faq = transitionFaq(faq, 'rollback')
  assert.equal(faq.published, null)
  assert.equal(matchingFaq([faq], input.question), undefined)
})

test('English whole-word and Cantonese sample matching abstain on unsupported or ambiguous prompts', () => {
  const en = initialWorkspace('en')
  const zh = initialWorkspace('zh-hant')
  assert.equal(matchingFaq(en.faqs, '  WHAT SERVICES DO YOU OFFER?! ')?.id, 'services')
  assert.equal(matchingFaq(en.faqs, 'How do I contact you?')?.id, 'booking')
  assert.equal(matchingFaq(en.faqs, 'Contactless credit cards'), undefined)
  assert.equal(matchingFaq(en.faqs, 'Languages and services'), undefined)
  assert.equal(matchingFaq(zh.faqs, '識唔識講廣東話？')?.id, 'language')
  assert.equal(answerFor('en', en, 'What is my bank balance?').source, null)
})

test('storyboard uses the requested format, topic and total duration', () => {
  const scenes = storyboard('en', 'Product launch', 'vertical', 60)
  assert.equal(scenes.length, 3)
  assert.match(scenes[0].visual, /9:16/)
  assert.match(scenes[0].script, /Product launch/)
  assert.match(scenes[2].time, /01:00$/)
})
