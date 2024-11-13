console.log("[Skool Hide Viewed Post] Background script running...");
let nextState = "OFF";

async function executeContentScript(tab) {
  console.log("Trigger content script...", tab);
  // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  // Next state will always be the opposite
  nextState = prevState === "ON" ? "OFF" : "ON";

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  console.log("[Skool Hide Viewed Post] Sending message to content script...");
  chrome.tabs.sendMessage(tab.id, {
    toggle: nextState === "ON",
    action: "init",
  });
}

if (chrome.action && chrome.action.onClicked) {
  // Manifest V3
  chrome.action.onClicked.addListener(executeContentScript);
} else if (chrome.browserAction && chrome.browserAction.onClicked) {
  // Manifest V2
  chrome.browserAction.onClicked.addListener(executeContentScript);
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  // read changeInfo data and do something with it (like read the url)
  if (changeInfo.status === "complete") {
    console.log("[Skool Hide Viewed Post] Tab updated, sending init request");
    chrome.tabs.sendMessage(tabId, {
      toggle: nextState === "ON",
      action: "update",
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});
