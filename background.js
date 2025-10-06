const SEARCH_ENGINES = {
  google: {
    title: 'Google',
    urlTemplate: 'https://www.google.com/search?q={s}'
  },
  gemini: {
    title: 'Gemini',
    urlTemplate: 'https://gemini.google.com/app'
  },
  youtube: {
    title: 'YouTube',
    urlTemplate: 'https://www.youtube.com/results?search_query={s}'
  }
};

function performGeminiSearch(selectedText) {
  const interval = setInterval(() => {
    const editor = document.querySelector('.ql-editor');
    const sendButton = document.querySelector('button.send-button');
    if (editor && sendButton) {
      clearInterval(interval);
      editor.querySelector('p').textContent = selectedText;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => {
        sendButton.click();
      }, 500);
    }
  }, 100);
}

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "searchParent",
      title: chrome.i18n.getMessage("contextMenuTitle"),
      contexts: ["selection"]
    });
    for (const id in SEARCH_ENGINES) {
      chrome.contextMenus.create({
        id: id,
        title: SEARCH_ENGINES[id].title,
        parentId: "searchParent",
        contexts: ["selection"]
      });
    }
  });
}

chrome.runtime.onInstalled.addListener(createMenus);
chrome.runtime.onStartup.addListener(createMenus);

chrome.contextMenus.onClicked.addListener((info) => {
  if (!info.selectionText) return;

  const engineId = info.menuItemId;
  const selectedText = info.selectionText;
  const engine = SEARCH_ENGINES[engineId];

  if (engineId === 'gemini') {
    chrome.tabs.create({ url: engine.urlTemplate, active: true }, (newTab) => {
      const listener = (tabId, changeInfo) => {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            function: performGeminiSearch,
            args: [selectedText]
          });
          chrome.tabs.onUpdated.removeListener(listener);
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  } else if (engine) {
    const finalUrl = engine.urlTemplate.replace('{s}', encodeURIComponent(selectedText));
    chrome.tabs.create({ url: finalUrl });
  }
});