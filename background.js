const SEARCH_ENGINES = {
  google: {
    title: 'Google',
    urlTemplate: 'https://www.google.com/search?q={s}'
  },
  gemini: {
    title: 'Gemini',
    urlTemplate: 'https://gemini.google.com/app?prompt={s}'
  },
  youtube: {
    title: 'YouTube',
    urlTemplate: 'https://www.youtube.com/results?search_query={s}'
  }
};

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "searchParent",
      title: "Buscar \"%s\" em...",
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

  const engine = SEARCH_ENGINES[info.menuItemId];

  if (engine) {
    const selectedText = encodeURIComponent(info.selectionText);
    const finalUrl = engine.urlTemplate.replace('{s}', selectedText);
    chrome.tabs.create({ url: finalUrl });
  }
});