console.log("[Skool Hide Viewed Post] Content script initialised.");

let ctr = 0;
let xpathToFeed =
  "/html/body/div[1]/div/div[1]/div[3]/div/div[1]/div/div/div[1]";
let opacity = "0.1";
const styledDotRegex = /^styled__Dot-[\w-]+$/;
const styledPostRegex = /^styled__PostItemWrapper-[\w-]+$/;
const styledRecentActivityRegex = /^styled__RecentActivityLabel-[\w-]+$/;
let observer;

// Add this event listener at the end of content.js
chrome.runtime.onMessage.addListener((request) => {
  console.log("[Skool Hide Viewed Post] Message received", request);
  if (request.toggle && request.action === "init") {
    init();
    setTimeout(() => {
      main();
    }, 100);
  } else if (request.toggle && request.action === "update") {
    setTimeout(() => {
      main();
    }, 100);
  } else {
    teardown();
  }
});

function init() {
  console.log(`[Skool Hide Viewed Post] init ${++ctr} times`);
  observer = new MutationObserver(() => {
    console.log(`[Skool Hide Viewed Post] Mutation observed`);
    main();
  });
  observer.observe(getRootNode(), {
    childList: true,
    subtree: true,
  });
}

function teardown() {
  console.log("[Skool Hide Viewed Post] teardown");
  const parentElements = getPostNodes();
  parentElements.forEach((parent) => {
    parent.style.opacity = "1";
  });
  observer.disconnect();
}

function main() {
  console.log("[Skool Hide Viewed Post] main");

  // Array of parent elements to check, you can adjust the selector as needed
  const parentElements = getPostNodes();

  // Run the function with the selected parent elements and target class name
  modifyOpacityIfNoChildClass(parentElements);
}

// Function to adjust opacity based on presence of a child element with a specific class name
function modifyOpacityIfNoChildClass(parents) {
  parents.forEach((parent) => {
    // Check if the parent contains any child with the target class
    const hasChildWithClass = hasStyledDotChild(parent);
    const hasNewComment = hasNewCommentLabel(parent);

    chrome.storage.sync.get(["shouldHideNewComment"], (result) => {
      let shouldHideNewComment = false;
      if (result.shouldHideNewComment) {
        shouldHideNewComment = true;
      }

      if (!hasChildWithClass) {
        if (shouldHideNewComment === false && hasNewComment) {
          return;
        }

        // Set opacity to 10% if no child with the class is found, otherwise leave it as is
        parent.style.opacity = opacity;
      }
    });
  });
}

function hasNewCommentLabel(parent) {
  // This function checks if the parent element has a child with inner text that starts with "New Comment"
  if (!parent || !(parent instanceof HTMLElement)) {
    console.log("[Skool Hide Viewed Post] Invalid parent element");
    return true;
  }

  // Find all elements in the parent's subtree
  const allElements = parent.querySelectorAll("*");

  // Filter elements with a matching class
  const matchingNodes = Array.from(allElements).filter((element) =>
    Array.from(element.classList).some((className) =>
      styledRecentActivityRegex.test(className)
    )
  );

  // Check for any element with a matching inner text
  return matchingNodes.some((element) => {
    return element.innerText.startsWith("New comment");
  });
}

function hasStyledDotChild(parent) {
  if (!parent || !(parent instanceof HTMLElement)) {
    console.log("[Skool Hide Viewed Post] Invalid parent element");
    return true;
  }

  // Find all elements in the parent's subtree
  const allElements = parent.querySelectorAll("*");

  // Check for any element with a matching class
  return Array.from(allElements).some((element) =>
    Array.from(element.classList).some((className) =>
      styledDotRegex.test(className)
    )
  );
}

function getPostNodes() {
  // Find all elements in the parent's subtree
  const allElements = document.body.querySelectorAll("*");

  // Filter elements with a matching class
  const matchingNodes = Array.from(allElements).filter((element) =>
    Array.from(element.classList).some((className) =>
      styledPostRegex.test(className)
    )
  );

  return matchingNodes;
}

function getRootNode() {
  const result = document.evaluate(
    xpathToFeed,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );

  if (!result.singleNodeValue) {
    throw new Error("[Skool Hide Viewed Post] Root node not found");
  }

  return result.singleNodeValue;
}
