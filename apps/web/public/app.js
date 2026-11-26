'use strict';
// In-memory language selection. No network calls or browser storage.
const languageButton = document.querySelector('#language');
let english = false;
languageButton.addEventListener('click', () => {
  english = !english;
  document.documentElement.lang = english ? 'en' : 'zh-Hant-HK';
  document.querySelectorAll('[data-zh][data-en]').forEach(element => {
    element.textContent = element.dataset[english ? 'en' : 'zh'];
  });
  languageButton.textContent = english ? '繁' : 'EN';
  languageButton.setAttribute('aria-label', english ? '切換至繁體中文' : 'Switch to English');
  document.title = english
    ? 'SAMPAN.ai — AI Corporate Ambassador · Prototype'
    : 'SAMPAN.ai — 企業專屬 AI 代言人 · Prototype';
});
