// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings
  chrome.storage.sync.set({
    enabled: true,
    level: "moderate",
    method: "rule-based",
    apiKey: "",
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "optimizeText") {
    // Get settings
    chrome.storage.sync.get(
      {
        level: "moderate",
        method: "rule-based",
        apiKey: "",
      },
      async (settings) => {
        let optimizedText = message.text;

        if (settings.method === "rule-based") {
          // Use local rule-based optimization
          optimizedText = optimizeUsingRules(message.text, settings.level);
          sendResponse({ success: true, optimizedText });
        } else if (settings.method === "ai-powered" && settings.apiKey) {
          try {
            // Use AI-powered optimization (simulation for now)
            // In a real extension, you'd call the OpenAI API here
            optimizedText = await simulateAIOptimization(
              message.text,
              settings.level
            );
            sendResponse({ success: true, optimizedText });
          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
        } else {
          sendResponse({
            success: false,
            error: "Missing API key or invalid method",
          });
        }
      }
    );

    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Rule-based optimization function
function optimizeUsingRules(text, level) {
  // Start with simple rules
  let optimized = text;

  // Remove excessive whitespace
  optimized = optimized.replace(/\s+/g, " ");

  // Trim leading/trailing whitespace
  optimized = optimized.trim();

  if (level === "moderate" || level === "aggressive") {
    // Remove common filler words
    const fillerWords =
      /\b(basically|actually|literally|very|really|just|that is|you know|like)\b/gi;
    optimized = optimized.replace(fillerWords, "");

    // Convert "I would like you to" → "Please"
    optimized = optimized.replace(/I would like you to/gi, "Please");
    optimized = optimized.replace(/Could you please/gi, "Please");
  }

  if (level === "aggressive") {
    // Replace "I want an explanation of" → "Explain"
    optimized = optimized.replace(/I want an explanation of/gi, "Explain");
    optimized = optimized.replace(/Can you explain/gi, "Explain");

    // Replace "I need you to provide" → "Provide"
    optimized = optimized.replace(/I need you to provide/gi, "Provide");

    // Remove pleasantries
    optimized = optimized.replace(
      /\b(hello|hi there|thanks in advance|thank you)\b/gi,
      ""
    );
  }

  // Clean up any double spaces created by replacements
  optimized = optimized.replace(/\s+/g, " ").trim();

  return optimized;
}

// Simulate AI optimization (in a real extension, this would call the OpenAI API)
async function simulateAIOptimization(text, level) {
  // This is just a simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      const optimized = optimizeUsingRules(text, level);
      // Further optimize based on level
      if (level === "aggressive") {
        resolve(
          optimized
            .split(" ")
            .slice(0, Math.ceil(optimized.split(" ").length * 0.7))
            .join(" ")
        );
      } else if (level === "moderate") {
        resolve(
          optimized
            .split(" ")
            .slice(0, Math.ceil(optimized.split(" ").length * 0.85))
            .join(" ")
        );
      } else {
        resolve(optimized);
      }
    }, 300);
  });
}
