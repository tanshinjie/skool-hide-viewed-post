document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("featureToggle");
  const status = document.getElementById("status");

  // Load the current state from Chrome storage
  chrome.storage.sync.get(["shouldHideNewComment"], (result) => {
    toggle.checked = result.shouldHideNewComment || false;
  });

  // Save the new state when the user clicks "Save"
  document.getElementById("save").addEventListener("click", () => {
    chrome.storage.sync.set({ shouldHideNewComment: toggle.checked }, () => {
      status.textContent = "Options saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 1500);
    });
  });
});
