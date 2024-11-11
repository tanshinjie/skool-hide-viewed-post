console.log("[Skool Read Post Enhancer] Content script initialised.");

let isRunning = false;
let feedClass =
  "styled__BoxWrapper-sc-z75ylc-0 bbCnni Column-sc-1kucbtm-0 jGQVBY";
let postClass = "styled__PostItemWrapper-sc-e4ns84-7";
let dotClass = "styled__Dot-sc-vh0utx-22";
let opacity = "0.1";

// Add this event listener at the end of content.js
chrome.runtime.onMessage.addListener((request) => {
  if (request.toggle) {
    isRunning = true;
    init();
    setTimeout(() => {
      main();
    }, 100);
  } else {
    isRunning = false;
  }
});

function main() {
  console.log("[Skool Read Post Enhancer] main");

  // Array of parent elements to check, you can adjust the selector as needed
  const parentElements = Array.from(document.getElementsByClassName(postClass));

  // Run the function with the selected parent elements and target class name
  modifyOpacityIfNoChildClass(parentElements, dotClass);
}

// Function to adjust opacity based on presence of a child element with a specific class name
function modifyOpacityIfNoChildClass(parents, targetClassName) {
  parents.forEach((parent) => {
    // Check if the parent contains any child with the target class
    const hasChildWithClass =
      parent.getElementsByClassName(targetClassName).length !== 0;

    // Set opacity to 10% if no child with the class is found, otherwise leave it as is
    if (!hasChildWithClass) {
      parent.style.opacity = opacity;
    }
  });
}

function init() {
  console.log("[Skool Read Post Enhancer] init");
  const observer = new MutationObserver(() => {
    console.log(
      `[Skool Read Post Enhancer] Mutation observed isRunning=${isRunning}`
    );
    if (isRunning) {
      main();
    }
  });

  observer.observe(document.getElementsByClassName(feedClass)[0], {
    childList: true,
    subtree: true,
  });
}
