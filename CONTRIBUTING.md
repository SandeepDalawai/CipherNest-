# Contributing

Thanks for your interest in improving the Password Strength Checker. Contributions that improve security, accessibility, clarity, or usability are welcome.

## Getting started

1. Fork the repository and create a branch for your change.
2. Open `index.html` in a modern browser to run the project. No package installation or build step is required.
3. Make focused changes in the existing HTML, CSS, or vanilla JavaScript files.
4. Check the page at desktop and mobile widths and use the keyboard to exercise interactive controls.
5. Describe your changes and checks in your pull request.

## Project guidelines

- Keep the app dependency-free and browser-only.
- Keep password analysis and UI rendering logic separate.
- Never transmit, log, or persist passwords. Do not add password values to URLs, cookies, browser storage, or analytics.
- Use the Web Crypto API for password generation. Do not use `Math.random()` for security-sensitive randomness.
- Render user-provided or generated text with safe DOM APIs such as `textContent`.
- Preserve keyboard access, visible focus styles, responsive behavior, and reduced-motion support.
- Keep the code readable and add comments when they clarify non-obvious security or scoring logic.

## Pull requests

Before opening a pull request:

- Explain the problem and the change.
- List the checks you actually performed; do not claim browser or security testing that you did not run.
- Include screenshots for visible interface changes when practical.
- Keep unrelated formatting or refactoring out of the change.

For security-related concerns, avoid posting real passwords, secrets, or sensitive account details in issues or pull requests. This project does not currently publish a dedicated private vulnerability-reporting contact.
