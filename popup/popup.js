document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const enableOptimizer = document.getElementById("enableOptimizer");
  const optimizationLevel = document.getElementById("optimizationLevel");
  const optimizationMethod = document.getElementById("optimizationMethod");
  const apiKeySection = document.getElementById("apiKeySection");
  const apiKey = document.getElementById("apiKey");
  const saveButton = document.getElementById("saveSettings");

  // Load saved settings
  chrome.storage.sync.get(
    {
      enabled: true,
      level: "moderate",
      method: "rule-based",
      apiKey: "",
    },
    function (items) {
      enableOptimizer.checked = items.enabled;
      optimizationLevel.value = items.level;
      optimizationMethod.value = items.method;
      apiKey.value = items.apiKey;

      // Show/hide API key section based on method
      apiKeySection.classList.toggle("hidden", items.method !== "ai-powered");
    }
  );

  // Toggle API key section visibility
  optimizationMethod.addEventListener("change", function () {
    apiKeySection.classList.toggle("hidden", this.value !== "ai-powered");
  });

  // Save settings
  saveButton.addEventListener("click", function () {
    chrome.storage.sync.set(
      {
        enabled: enableOptimizer.checked,
        level: optimizationLevel.value,
        method: optimizationMethod.value,
        apiKey: apiKey.value,
      },
      function () {
        // Show success message
        const status = document.createElement("div");
        status.textContent = "Settings saved!";
        status.className = "mt-2 text-center text-green-600";
        saveButton.parentNode.appendChild(status);

        setTimeout(function () {
          status.remove();
        }, 1500);

        // Send message to content script to update settings
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "settingsUpdated",
              settings: {
                enabled: enableOptimizer.checked,
                level: optimizationLevel.value,
                method: optimizationMethod.value,
              },
            });
          }
        );
      }
    );
  });
});
