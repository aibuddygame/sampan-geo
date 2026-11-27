'use client'

import { createContext, useContext, useState } from 'react'
import { initialWorkspace, saveDraft, transitionFaq } from '../lib/workspace'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ locale, children }) {
  const [workspace, setWorkspace] = useState(() => initialWorkspace(locale))
  function updateBehaviour(settings) {
    setWorkspace(current => ({ ...current, behaviour: { ...current.behaviour, ...settings } }))
  }
  function editFaq(id, values) {
    setWorkspace(current => {
      if (!id) {
        const blank = { id: crypto.randomUUID(), aliases: [], lastRevision: 0, draft: null, published: null, prior: [] }
        return { ...current, faqs: [...current.faqs, saveDraft(blank, values)] }
      }
      return { ...current, faqs: current.faqs.map(faq => faq.id === id ? saveDraft(faq, values) : faq) }
    })
  }
  function moveFaq(id, action) {
    setWorkspace(current => ({ ...current, faqs: current.faqs.map(faq => faq.id === id ? transitionFaq(faq, action) : faq) }))
  }
  return <WorkspaceContext.Provider value={{ workspace, updateBehaviour, editFaq, moveFaq }}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
