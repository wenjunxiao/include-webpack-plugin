chrome.runtime.onInstalled.addListener((details) => {
  console.log('chrome.runtime.onInstalled', details);
  chrome.contextMenus.create({
    "id": "sampleContextMenu",
    "title": "Sample Context Menu",
    "contexts": ["selection"]
  });
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL ||
      details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    chrome.tabs.create({
      url: 'onboarding.html'
    });
  }
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log("message received =>", msg, sender, sendResponse);
});

chrome.action.onClicked.addListener((tab) => {
  console.log('tab =>', tab);
  chrome.tabs.create({
    url: 'onboarding.html'
  });
});
