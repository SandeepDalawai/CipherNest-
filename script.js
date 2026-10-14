"use strict";

const elements = {
  password: document.querySelector("#password-input"),
  toggleVisibility: document.querySelector("#toggle-visibility"),
  copyPassword: document.querySelector("#copy-password"),
  clearPassword: document.querySelector("#clear-password"),
  strengthLabel: document.querySelector("#strength-label"),
  scoreValue: document.querySelector("#score-value"),
  strengthFill: document.querySelector("#strength-fill"),
  strengthMeter: document.querySelector("#strength-meter"),
  meterMessage: document.querySelector("#meter-message"),
  lengthCount: document.querySelector("#length-count"),
  requirements: document.querySelector("#requirements-list"),
  requirementCount: document.querySelector("#requirement-count"),
  suggestions: document.querySelector("#suggestions-list"),
  lengthSlider: document.querySelector("#length-slider"),
  lengthValue: document.querySelector("#length-value"),
  generateButton: document.querySelector("#generate-password"),
  useGenerated: document.querySelector("#use-generated"),
  generatorError: document.querySelector("#generator-error"),
};

const CHARACTER_SETS = {
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lower: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
};

const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "123456", "12345678", "123456789",
  "qwerty", "qwerty123", "letmein", "welcome", "admin", "iloveyou",
  "abc123", "monkey", "dragon", "football", "master", "sunshine",
]);

const STRENGTH_STEPS = [
  { minimum: 0, label: "Very Weak", color: "#ed727c", message: "Easy to guess. Try a longer, less predictable password." },
  { minimum: 25, label: "Weak", color: "#ef9a71", message: "Some protection, but a few changes could help a lot." },
  { minimum: 45, label: "Moderate", color: "#e8bd70", message: "A reasonable start. Add length and variety to improve it." },
  { minimum: 65, label: "Strong", color: "#70c9a5", message: "Good resistance to common guessing attempts." },
  { minimum: 85, label: "Very Strong", color: "#54d5c0", message: "Long and hard to guess. Keep it unique to this account." },
];

/** Detect runs like abc, 987, qwerty, and repeated character patterns. */
function findPredictablePatterns(password) {
  const lower = password.toLowerCase();
  const found = [];
  const keyboardRuns = ["qwerty", "asdf", "zxcv", "qwert", "asdfg", "zxcvb"];

  if (/(.)\1{2,}/iu.test(password)) found.push("repeated characters");
  if (/(.{2,4})\1{1,}/iu.test(password)) found.push("repeated chunks");
  if (keyboardRuns.some((run) => lower.includes(run))) found.push("keyboard sequence");

  for (let index = 0; index < password.length - 2; index += 1) {
    const first = password.charCodeAt(index);
    const second = password.charCodeAt(index + 1);
    const third = password.charCodeAt(index + 2);
    if ((second === first + 1 && third === second + 1) ||
        (second === first - 1 && third === second - 1)) {
      found.push("sequential characters");
      break;
    }
  }
  return [...new Set(found)];
}

/** Pure analysis function: returns an estimate and guidance without touching the DOM. */
function analyzePassword(password) {
  const checks = {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    patterns: findPredictablePatterns(password).length === 0,
  };

  if (!password) {
    return { score: 0, category: "Waiting for a password", checks, suggestions: ["Start typing to get tailored suggestions."], patterns: [], common: false, empty: true };
  }

  const lower = password.toLowerCase();
  const normalized = lower.replace(/[\s._-]/g, "");
  const common = COMMON_PASSWORDS.has(normalized) ||
    ["password", "qwerty", "letmein", "welcome"].some((word) => normalized.includes(word));
  const patterns = findPredictablePatterns(password);
  const characterTypes = [checks.upper, checks.lower, checks.number, checks.symbol].filter(Boolean).length;
  const uniqueRatio = new Set(password).size / password.length;

  // Length and character diversity both help, while known patterns and common words reduce the estimate.
  let score = Math.min(password.length * 3.4, 50);
  score += Math.max(0, characterTypes - 1) * 5;
  score += Math.round(uniqueRatio * 15);
  if (password.length >= 16) score += 7;
  if (password.length >= 20) score += 5;
  if (/\s/.test(password) && password.trim().split(/\s+/).length >= 3) score += 4;
  score -= patterns.includes("sequential characters") ? 14 : 0;
  score -= patterns.includes("keyboard sequence") ? 18 : 0;
  score -= patterns.includes("repeated characters") ? 16 : 0;
  score -= patterns.includes("repeated chunks") ? 15 : 0;
  if (common) score -= 48;

  // A short password cannot be rated strong just because it uses many character types.
  if (password.length < 8) score = Math.min(score, 20);
  else if (password.length < 12) score = Math.min(score, 54);
  score = Math.max(0, Math.min(100, Math.round(score)));

  const suggestions = [];
  if (common) suggestions.push("Avoid common passwords and familiar words; they are easy to try first.");
  if (password.length < 12) suggestions.push("Increase the length to at least 12 characters; a longer passphrase works well.");
  else if (password.length < 16) suggestions.push("Consider making it longer for a larger safety margin.");
  if (patterns.length) suggestions.push(`Remove ${patterns.join(" and ")}; predictable patterns are easier to guess.`);
  if (characterTypes < 3 && password.length < 16) suggestions.push("Add some character variety, or use several unrelated words in a long passphrase.");
  if (uniqueRatio < 0.7 && !patterns.length) suggestions.push("Use more distinct characters and avoid repeating chunks.");
  if (suggestions.length === 0) suggestions.push("Good structure. Keep this password unique and store it in a password manager.");
  suggestions.push("Use a different password for every account.");

  const category = [...STRENGTH_STEPS].reverse().find((step) => score >= step.minimum).label;
  return { score, category, checks, suggestions: [...new Set(suggestions)].slice(0, 4), patterns, common, empty: false };
}

function renderAnalysis(password) {
  const result = analyzePassword(password);
  let level = STRENGTH_STEPS[0];
  for (const step of STRENGTH_STEPS) {
    if (result.score >= step.minimum) level = step;
  }
  elements.strengthLabel.textContent = result.category;
  elements.scoreValue.textContent = result.empty ? "—" : String(result.score);
  elements.strengthFill.style.width = `${result.empty ? 0 : result.score}%`;
  elements.strengthFill.style.backgroundColor = level.color;
  elements.strengthMeter.setAttribute("aria-valuenow", String(result.score));
  elements.meterMessage.textContent = result.empty ? "Enter a password to see its estimate." : level.message;
  elements.lengthCount.textContent = `${password.length} ${password.length === 1 ? "character" : "characters"}`;

  let passed = 0;
  for (const item of elements.requirements.querySelectorAll("li")) {
    const isPassed = Boolean(result.checks[item.dataset.check]);
    item.classList.toggle("passed", isPassed);
    item.querySelector(".check-icon").textContent = isPassed ? "✓" : "·";
    if (isPassed) passed += 1;
  }
  elements.requirementCount.textContent = `${passed} / 6`;

  elements.suggestions.replaceChildren();
  for (const suggestion of result.suggestions) {
    const item = document.createElement("li");
    item.textContent = suggestion;
    elements.suggestions.append(item);
  }
}

/** Securely select an integer in [0, upperBound) without modulo bias. */
function secureRandomInt(upperBound) {
  const range = 0x100000000;
  const limit = Math.floor(range / upperBound) * upperBound;
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % upperBound;
}

function generateSecurePassword(length, selectedSets) {
  if (!globalThis.crypto || typeof crypto.getRandomValues !== "function") {
    throw new Error("Secure random generation is unavailable in this browser context.");
  }
  if (selectedSets.length === 0) throw new Error("Select at least one character type.");
  if (length < selectedSets.length) throw new Error("Choose a length at least as long as the number of selected character types.");

  const allCharacters = selectedSets.join("");
  const password = selectedSets.map((set) => set[secureRandomInt(set.length)]);
  while (password.length < length) password.push(allCharacters[secureRandomInt(allCharacters.length)]);
  // Fisher–Yates with cryptographically selected indices avoids predictable placement.
  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomInt(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }
  return password.join("");
}

function selectedCharacterSets() {
  const sets = [];
  if (document.querySelector("#include-upper").checked) sets.push(CHARACTER_SETS.upper);
  if (document.querySelector("#include-lower").checked) sets.push(CHARACTER_SETS.lower);
  if (document.querySelector("#include-numbers").checked) sets.push(CHARACTER_SETS.numbers);
  if (document.querySelector("#include-symbols").checked) sets.push(CHARACTER_SETS.symbols);
  return sets;
}

elements.password.addEventListener("input", () => renderAnalysis(elements.password.value));

elements.toggleVisibility.addEventListener("click", () => {
  const willShow = elements.password.type === "password";
  elements.password.type = willShow ? "text" : "password";
  elements.toggleVisibility.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
  elements.toggleVisibility.title = willShow ? "Hide password" : "Show password";
});

elements.copyPassword.addEventListener("click", async () => {
  if (!elements.password.value) {
    elements.meterMessage.textContent = "Type a password first to copy it.";
    return;
  }
  try {
    await navigator.clipboard.writeText(elements.password.value);
    elements.meterMessage.textContent = "Password copied to clipboard.";
  } catch {
    elements.meterMessage.textContent = "Clipboard access is unavailable. Select and copy the password manually.";
  }
});

elements.clearPassword.addEventListener("click", () => {
  elements.password.value = "";
  elements.password.type = "password";
  elements.toggleVisibility.setAttribute("aria-label", "Show password");
  elements.toggleVisibility.title = "Show password";
  elements.generatorError.textContent = "";
  renderAnalysis("");
  elements.password.focus();
});

elements.lengthSlider.addEventListener("input", () => {
  elements.lengthValue.textContent = elements.lengthSlider.value;
});

elements.generateButton.addEventListener("click", () => {
  elements.generatorError.textContent = "";
  try {
    const generated = generateSecurePassword(Number(elements.lengthSlider.value), selectedCharacterSets());
    elements.password.value = generated;
    elements.password.type = "password";
    elements.toggleVisibility.setAttribute("aria-label", "Show password");
    elements.toggleVisibility.title = "Show password";
    elements.useGenerated.disabled = false;
    renderAnalysis(generated);
  } catch (error) {
    elements.generatorError.textContent = error.message;
    elements.useGenerated.disabled = true;
  }
});

elements.useGenerated.addEventListener("click", () => {
  elements.password.focus();
  elements.password.scrollIntoView({ behavior: "smooth", block: "center" });
});

renderAnalysis("");
