// Global settings
let settings = {
  enabled: true,
  level: 'moderate',
  method: 'rule-based'
};

// List of supported sites and their input field selectors
const SUPPORTED_SITES = {
  'chat.openai.com': {
    inputSelector: 'textarea[data-id="root"]',
    buttonSelector: 'button[data-testid="send-button"]'
  },
  'claude.ai': {
    inputSelector: 'div[contenteditable="true"]',
    buttonSelector: 'button.send-button'
  },
  'gemini.google.com': {
    inputSelector: 'textarea[aria-label="Input box for conversing with Gemini"]',
    buttonSelector: 'button[aria-label="Send message"]'
  }
};

// Get current site config
function getSiteConfig() {
  const hostname = window.location.hostname;
  for (const site in SUPPORTED_SITES) {
    if (hostname.includes(site)) {
      return SUPPORTED_SITES[site];
    }
  }
  return null;
}

// Function to add our UI elements
function addOptimizerUI() {
  const siteConfig = getSiteConfig();
  if (!siteConfig) return;

  // Find the input field
  const inputElement = document.querySelector(siteConfig.inputSelector);
  if (!inputElement) return;

  // Create optimizer button
  const optimizerButton = document.createElement("div");
  optimizerButton.innerHTML = `
    <button id="token-optimizer-btn" style="
      position: absolute;
      right: 70px;
      bottom: 14px;
      z-index: 1000;
      padding: 4px 8px;
      border-radius: 4px;
      background-color: #2563eb;
      color: white;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      Optimize
    </button>
  `;

  // Add the button near the input field
  if (inputElement.parentElement) {
    inputElement.parentElement.style.position = "relative";
    inputElement.parentElement.appendChild(optimizerButton);

    // Add event listener to optimizer button
    document
      .getElementById("token-optimizer-btn")
      .addEventListener("click", function () {
        if (!settings.enabled) return;

        // Get the current text from the input field
        let currentText = "";
        if (inputElement.tagName.toLowerCase() === "textarea") {
          currentText = inputElement.value;
        } else if (inputElement.getAttribute("contenteditable") === "true") {
          currentText = inputElement.innerText;
        }

        if (!currentText.trim()) return;

        // Show optimization in progress
        this.innerHTML = `
        <span style="display: flex; align-items: center; gap: 4px;">
          <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          Optimizing...
        </span>
      `;

        // Send message to background script to optimize the text
        chrome.runtime.sendMessage(
          {
            action: "optimizeText",
            text: currentText,
          },
          (response) => {
            if (response && response.success) {
              // Update the input field with optimized text
              if (inputElement.tagName.toLowerCase() === "textarea") {
                inputElement.value = response.optimizedText;
                // Trigger input event to update the UI
                const event = new Event("input", { bubbles: true });
                inputElement.dispatchEvent(event);
              } else if (
                inputElement.getAttribute("contenteditable") === "true"
              ) {
                inputElement.innerText = response.optimizedText;
                // Trigger input event
                const event = new InputEvent("input", { bubbles: true });
                inputElement.dispatchEvent(event);
              }

              // Create a preview popup
              showOptimizationPreview(currentText, response.optimizedText);
            } else {
              console.error(
                "Optimization failed:",
                response?.error || "Unknown error"
              );
            }

            // Reset button
            this.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          Optimize
        `;
          }
        );
      });
  }
}

// Function to show the optimization preview
function showOptimizationPreview(original, optimized) {
  // Calculate token reduction (very rough estimate)
  const originalTokens = original.split(/\s+/).length;
  const optimizedTokens = optimized.split(/\s+/).length;
  const tokenReduction = originalTokens - optimizedTokens;
  const percentReduction = Math.round((tokenReduction / originalTokens) * 100);

  // Create a preview popup
  const previewPopup = document.createElement("div");
  previewPopup.style = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 320px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    padding: 16px;
    font-size: 14px;
    color: #333;
  `;

  previewPopup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Token Optimization</h3>
      <button id="close-preview" style="background: none; border: none; cursor: pointer; color: #888;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div style="margin-bottom: 12px;">
      <div style="color: #2563eb; font-weight: 600; margin-bottom: 4px;">
        Tokens Saved: ~${tokenReduction} (${percentReduction}%)
      </div>
      <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
        <div style="height: 100%; width: ${
          100 - percentReduction
        }%; background-color: #2563eb;"></div>
      </div>
    </div>
    <div style="margin-bottom: 8px; font-weight: 500;">Original Text:</div>
    <div style="background-color: #f3f4f6; padding: 8px; border-radius: 4px; margin-bottom: 12px; max-height: 100px; overflow-y: auto; white-space: pre-wrap;">
      ${original}
    </div>
    <div style="margin-bottom: 8px; font-weight: 500;">Optimized Text:</div>
    <div style="background-color: #f0f9ff; padding: 8px; border-radius: 4px; border-left: 3px solid #2563eb; white-space: pre-wrap;">
      ${optimized}
    </div>
  `;

  document.body.appendChild(previewPopup);

  // Add close button functionality
  document
    .getElementById("close-preview")
    .addEventListener("click", function () {
      previewPopup.remove();
    });

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.body.contains(previewPopup)) {
      previewPopup.remove();
    }
  }, 10000);
}

// Initialize the extension
function initialize() {
  // Load settings
  chrome.storage.sync.get(
    {
      enabled: true,
      level: "moderate",
      method: "rule-based",
    },
    function (items) {
      settings = items;

      // Add the optimizer UI
      addOptimizerUI();

      // Add mutation observer to handle dynamic site changes
      observeSiteChanges();
    }
  );
}

// Observe site changes to handle dynamic content loading
function observeSiteChanges() {
  const observer = new MutationObserver((mutations) => {
    const siteConfig = getSiteConfig();
    if (!siteConfig) return;

    // Check if our button is still present
    const optimizerBtn = document.getElementById("token-optimizer-btn");
    if (!optimizerBtn) {
      addOptimizerUI();
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Listen for setting updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "settingsUpdated") {
    settings = message.settings;
  }
});

// Add CSS for animations
const style = document.createElement("style");
style.textContent = `
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
