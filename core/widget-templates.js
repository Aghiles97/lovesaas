/**
 * Modular Aggregator for Decomposed Production Widgets
 * Aggregates all 13 standalone widget templates for both Node.js (SSR) and Browser.
 */
if (typeof escapeHtml !== "function") {
  if (typeof window !== "undefined") {
    window.escapeHtml = function(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
  } else {
    global.escapeHtml = function(str) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
  }
}
if (typeof safeVal !== "function") {
  if (typeof window !== "undefined") {
    window.safeVal = function(v) {
      return String(v == null ? "" : v).replace(/"/g, "&quot;");
    };
  } else {
    global.safeVal = function(v) {
      return String(v == null ? "" : v).replace(/"/g, "&quot;");
    };
  }
}

var WIDGET_TEMPLATES = (typeof window !== "undefined" && window.WIDGET_TEMPLATES) ? window.WIDGET_TEMPLATES : {};

if (typeof module !== "undefined" && module.exports) {
  WIDGET_TEMPLATES = {
    hero: require("./templates/hero.template.js"),
    love_meter: require("./templates/love_meter.template.js"),
    reasons: require("./templates/reasons.template.js"),
    map: require("./templates/map.template.js"),
    timeline: require("./templates/timeline.template.js"),
    truth_dare: require("./templates/truth_dare.template.js"),
    spinner: require("./templates/spinner.template.js"),
    memories: require("./templates/memories.template.js"),
    coupons: require("./templates/coupons.template.js"),
    boarding_pass: require("./templates/boarding_pass.template.js"),
    quiz: require("./templates/quiz.template.js"),
    letter: require("./templates/letter.template.js"),
    playful: require("./templates/playful.template.js")
  };
  module.exports = { WIDGET_TEMPLATES };
}

if (typeof window !== "undefined") {
  window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
  Object.assign(window.WIDGET_TEMPLATES, WIDGET_TEMPLATES);
  WIDGET_TEMPLATES = window.WIDGET_TEMPLATES;
}
