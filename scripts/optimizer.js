// Optimizer.js - Additional optimization functions

// Function to estimate token count
function estimateTokenCount(text) {
  // Simple estimation: ~4 characters = 1 token
  // This is a very rough approximation
  return Math.ceil(text.length / 4);
}

// Additional optimization techniques
function advancedOptimize(text, level) {
  let optimized = text;

  // Common transformations for all levels
  // Replace "I'm writing to you to ask about" → "Regarding"
  optimized = optimized.replace(
    /I'm writing to you to ask about/gi,
    "Regarding"
  );
  optimized = optimized.replace(/I was wondering if you could/gi, "Please");

  // Level-specific optimizations
  switch (level) {
    case "mild":
      // Only remove obvious redundancies
      optimized = optimized.replace(/\b(in order to)\b/gi, "to");
      optimized = optimized.replace(/\b(due to the fact that)\b/gi, "because");
      break;

    case "moderate":
      // More aggressive replacements
      optimized = optimized.replace(/\b(in order to)\b/gi, "to");
      optimized = optimized.replace(/\b(due to the fact that)\b/gi, "because");
      optimized = optimized.replace(/\b(at this point in time)\b/gi, "now");
      optimized = optimized.replace(/\b(in the event that)\b/gi, "if");
      optimized = optimized.replace(/\b(on a regular basis)\b/gi, "regularly");

      // Convert passive to active voice (simplified approach)
      optimized = optimized.replace(/\b(is being done by)\b/gi, "does");
      optimized = optimized.replace(/\b(was conducted by)\b/gi, "conducted");
      break;

    case "aggressive":
      // All the above plus more
      optimized = optimized.replace(/\b(in order to)\b/gi, "to");
      optimized = optimized.replace(/\b(due to the fact that)\b/gi, "because");
      optimized = optimized.replace(/\b(at this point in time)\b/gi, "now");
      optimized = optimized.replace(/\b(in the event that)\b/gi, "if");
      optimized = optimized.replace(/\b(on a regular basis)\b/gi, "regularly");
      optimized = optimized.replace(/\b(in the near future)\b/gi, "soon");
      optimized = optimized.replace(
        /\b(it is important to note that)\b/gi,
        "note:"
      );
      optimized = optimized.replace(/\b(for the purpose of)\b/gi, "for");

      // Remove unnecessary context
      optimized = optimized.replace(
        /\b(As an AI language model|As an AI assistant)\b/gi,
        ""
      );

      // Convert questions to directives
      optimized = optimized.replace(/\b(Can you tell me how to)\b/gi, "How to");
      optimized = optimized.replace(
        /\b(I'd like to know more about)\b/gi,
        "Explain"
      );
      break;
  }

  return optimized;
}

// Export these functions for use in background.js
// Note: This isn't necessary in a content script, but keeping it modular
if (typeof module !== "undefined") {
  module.exports = {
    estimateTokenCount,
    advancedOptimize,
  };
}
