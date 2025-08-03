// --- DOM Element References ---
const driveLinkInput = document.getElementById("driveLink");
const outputLinkInput = document.getElementById("outputLink");
const statusMessage = document.getElementById("statusMessage");
const copyButton = document.querySelector(".copy-btn");
const themeToggle = document.getElementById("themeToggle");
const generateButton = document.getElementById("generateButton");
const generateButtonText = generateButton.querySelector(".button-text");
const generateButtonSpinner = generateButton.querySelector(".loader-spinner");

let statusMessageTimeoutId;

// --- Initial Setup on Page Load ---
document.addEventListener("DOMContentLoaded", () => {
  toggleCopyButtonState();
  applySavedTheme(); // Apply theme from local storage on load
});

// --- Theme Management Functions ---

/**
 * Applies the theme saved in local storage or the default (light) theme.
 * Updates the body class and the theme toggle checkbox.
 */
function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.checked = true; // Set checkbox to checked for dark theme
  } else {
    document.body.classList.remove("dark-theme");
    themeToggle.checked = false; // Set checkbox to unchecked for light theme
  }
}

/**
 * Event listener for theme toggle.
 * Adds/removes 'dark-theme' class to body, saves preference to local storage.
 */
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("dark-theme");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-theme");
    localStorage.setItem("theme", "light");
  }
});

// --- Status Message Handling ---

/**
 * Displays a status message to the user with a specific type (success, error, info).
 * The message fades in and then fades out after a set duration.
 * @param {string} message - The text content of the status message.
 * @param {string} type - The type of message ('success', 'error', 'info').
 */
function displayStatusMessage(message, type = "success") {
  clearTimeout(statusMessageTimeoutId);

  statusMessage.textContent = message;
  statusMessage.setAttribute("data-type", type);

  statusMessage.classList.add("show");
  statusMessage.style.display = "block";

  statusMessageTimeoutId = setTimeout(() => {
    statusMessage.classList.remove("show");

    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.style.display = "none";
      statusMessage.removeAttribute("data-type");
    }, 400); // Matches CSS transition duration
  }, 5000);
}

// --- Copy Button State Management ---

/**
 * Toggles the visual state of the copy button (opacity, cursor, pointer-events)
 * based on whether there's a link in the output field.
 */
function toggleCopyButtonState() {
  const isDisabled = !outputLinkInput.value;
  copyButton.style.pointerEvents = isDisabled ? "none" : "auto";
  copyButton.style.opacity = isDisabled ? "0.5" : "1";
  copyButton.style.cursor = isDisabled ? "not-allowed" : "pointer";
}

// --- Generate Button Loading Animation ---

/**
 * Activates the loading state for the generate button.
 * Hides text, shows spinner, disables clicks.
 */
function startButtonLoading() {
  generateButton.classList.add("loading");
}

/**
 * Deactivates the loading state for the generate button.
 * Shows text, hides spinner, enables clicks.
 */
function stopButtonLoading() {
  generateButton.classList.remove("loading");
}

// --- Main Link Generation Logic ---

/**
 * Handles the generation of the direct download link.
 * Initiates loading states, validates input, processes the link, and updates UI.
 */
async function generateLink() {
  const input = driveLinkInput.value.trim();

  // Clear previous output and status
  outputLinkInput.value = "";
  statusMessage.classList.remove("show");
  statusMessage.textContent = "";
  statusMessage.style.display = "none";
  statusMessage.removeAttribute("data-type");

  toggleCopyButtonState();

  // Input validation
  if (!input) {
    displayStatusMessage("Please enter a Google Drive link.", "error");
    return;
  }

  // Start visual feedback: button loading
  startButtonLoading();

  // Simulate a network/processing delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Regular expression to extract file ID from common Google Drive link formats
  const match = input.match(
    /(?:https?:\/\/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/document\/d\/))([a-zA-Z0-9_-]+)/
  );

  if (match && match[1]) {
    const fileId = match[1];
    const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
    outputLinkInput.value = directLink;
    displayStatusMessage(
      "Direct download link generated successfully!",
      "success"
    );

    outputLinkInput.focus();
    outputLinkInput.select();
  } else {
    displayStatusMessage(
      "Invalid Google Drive link format. Please ensure it's a valid file link.",
      "error"
    );
  }

  // Stop visual feedback
  stopButtonLoading();
  toggleCopyButtonState();
}

// --- Copy to Clipboard Logic ---

/**
 * Copies the content of the output link input field to the clipboard.
 * Provides user feedback via status message.
 */
function copyToClipboard() {
  if (!outputLinkInput.value) {
    displayStatusMessage("No link to copy!", "info");
    return;
  }

  outputLinkInput.select();
  try {
    document.execCommand("copy");
    displayStatusMessage("Link copied to clipboard!", "success");
  } catch (err) {
    console.error("Copy command failed:", err);
    displayStatusMessage("Failed to copy link. Please copy manually.", "error");
  }

  window.getSelection().removeAllRanges();
}
