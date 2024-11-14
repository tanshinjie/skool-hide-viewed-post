console.log("[Skool Hide Viewed Post] Background script running...");

async function executeContentScript(tab) {
  const result = await getLocalStorageValue("isActivated");

  let oldState = result.isActivated;
  let newState = !oldState;

  try {
    chrome.tabs.sendMessage(tab.id, {
      toggle: newState,
      action: "init",
    });

    // Set the action badge to the next state
    chrome.action.setBadgeText({
      tabId: tab.id,
      text: newState ? "ON" : "OFF",
    });

    chrome.storage.sync.set({ isActivated: newState });
  } catch (error) {
    console.log("Error:", error);
    console.log("Assuming not on www.skool.com, skipping message.");
  }
}

if (chrome.action && chrome.action.onClicked) {
  // Manifest V3
  chrome.action.onClicked.addListener(executeContentScript);
} else if (chrome.browserAction && chrome.browserAction.onClicked) {
  // Manifest V2
  chrome.browserAction.onClicked.addListener(executeContentScript);
}

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo) {
  // read changeInfo data and do something with it (like read the url)
  if (changeInfo.status === "complete") {
    console.log("[Skool Hide Viewed Post] Tab updated, sending init request");

    const result = await getLocalStorageValue("isActivated");

    chrome.tabs.sendMessage(tabId, {
      toggle: result.isActivated,
      action: "update",
    });
    chrome.action.setBadgeText({
      text: result.isActivated ? "ON" : "OFF",
    });
  }
});

async function getLocalStorageValue(key) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(key, function (value) {
        resolve(value);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

function isTabOnSkool(tabUrl) {
  try {
    const url = new URL(tabUrl);
    return url.hostname === "www.skool.com";
  } catch (error) {
    console.error("Invalid URL:", tabUrl);
    return false;
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({
    shouldHideNewComment: false,
    isActivated: false,
  });
  chrome.action.setBadgeText({
    text: "OFF",
  });
});
