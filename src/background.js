console.log("[Skool Hide Viewed Post] Background script running...");
let nextState = "OFF";

async function executeContentScript(tab) {
  // Function to send a message if the active tab is on www.skool.com
  try {
    // Send a message to the content script
    console.log("Trigger content script...", tab);

    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    nextState = prevState === "ON" ? "OFF" : "ON";

    console.log(
      "[Skool Hide Viewed Post] Sending message to content script..."
    );
    chrome.tabs.sendMessage(tab.id, {
      toggle: nextState === "ON",
      action: "init",
    });

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });
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

    chrome.tabs.sendMessage(tabId, {
      toggle: nextState === "ON",
      action: "update",
    });
    chrome.action.setBadgeText({
      text: nextState,
    });
  }
});

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
  console.log("[Skool Hide Viewed Post] Extension installed");
  chrome.storage.sync.set({ shouldHideNewComment: false });
  chrome.action.setBadgeText({
    text: nextState,
  });
});
