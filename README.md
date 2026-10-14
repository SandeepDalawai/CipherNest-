# CipherNest Password Strength Checker

CipherNest is a responsive, browser-only password checker and secure password generator built with HTML, CSS, and vanilla JavaScript. It gives an educational strength estimate, explains ways to improve a password, and generates random passwords with the Web Crypto API.

## Project structure

```text
password-strength-checker/
├── index.html   # Accessible page structure and tool controls
├── style.css    # Responsive layout, visual states, and focus styles
├── script.js    # Heuristic analysis, UI updates, and secure generation
└── README.md    # Project notes, setup, and report material
```

## Run locally

1. Download or clone this folder.
2. Open `index.html` in a current desktop or mobile browser.
3. Type or paste a password to see its estimate and suggestions. Use **Generate password** to create a cryptographically random candidate.

The app has no build step, account, backend, database, or external service dependency. The optional Google Fonts import is decorative; the page falls back to system fonts if it is unavailable. The generator requires a browser context that provides `crypto.getRandomValues()`.

## Features

- Live strength score from 0–100 and five text-labeled categories.
- Live checklist for length, character types, and obvious patterns.
- Suggestions based on password length, common terms, sequences, repeated characters, and character diversity.
- Show/hide, clear, and copy controls.
- Configurable password generator with length and character-set options.
- Cryptographic randomness, rejection sampling for unbiased index selection, and secure Fisher–Yates shuffling.
- Responsive layout, keyboard-accessible controls, visible focus states, and reduced-motion support.
- Privacy notice explaining local analysis and the limitations of the estimate.

## Architecture

`analyzePassword()` is a pure scoring and recommendation function. It does not access page elements. `renderAnalysis()` takes its result and updates the visible score, meter, checklist, and suggestions using `textContent` and DOM methods. Generator logic is separated into `secureRandomInt()`, `generateSecurePassword()`, and `selectedCharacterSets()`.

The heuristic combines length, character variety, unique-character ratio, and a small bonus for long multiword passphrases. It lowers the score for common passwords, sequential or keyboard patterns, and repeated characters or chunks. Short passwords have score caps so character variety alone cannot make one appear strong. The score is a learning aid, not a security guarantee.

## Security and privacy

- Password analysis and generation run in the browser. The app makes no password-related network requests.
- Passwords are not placed in the URL, saved to browser storage, or written to the console.
- **Clear** empties the input and resets the analysis display.
- The generator uses `crypto.getRandomValues()`, not `Math.random()`.
- Clipboard copy is initiated only when the user presses the copy button.
- The app does not check breached-password databases. It cannot tell you whether a password has appeared in a known data breach.
- Do not reuse passwords. A password manager and multifactor authentication provide useful additional protection.

## Project abstract

This project presents a client-side password strength checker designed to teach safer password habits. It estimates password strength using length, character diversity, uniqueness, and predictable-pattern checks, then provides a live checklist and tailored improvement suggestions. A configurable generator uses the browser's cryptographic random-number generator to create passwords. All analysis stays in the browser, demonstrating a privacy-conscious approach using only standard web technologies.

## Suggested test cases

| Input or action | Expected behavior |
| --- | --- |
| Empty input | No numeric score; checklist is unsatisfied; placeholder guidance is shown. |
| `aB3!` | Very short, low score, and length advice. |
| `password123` | Low score; common-password and sequence guidance. |
| `12345678` | Low score; sequence guidance and character-type requirements fail. |
| `alllowercaseletters` | Lowercase and length checks pass; advice encourages more unpredictability. |
| `Cedar!Orbit7Lake?` | Longer mixed password receives a stronger estimate; most checklist items pass. |
| `quiet river amber meadow` | Spaces are accepted; long passphrase receives length guidance and no special-character pass. |
| `aaaaaaaaaaaa` | Repeated-character pattern is detected and the score is reduced. |
| `Orchid!Blue#Harbor9` | Special-character check passes; score reflects length and variety. |
| Generate with all types enabled | Password matches selected length and contains at least one character from each set. |
| Generate with only lowercase enabled | Password uses lowercase characters only and matches selected length. |
| Toggle visibility, copy, and clear | Visibility changes; copy gives status feedback when permitted; clear resets input and results. |

## Known limitations and future work

- The score is a heuristic and does not model every guessing strategy or attacker capability.
- No breach database check is performed, and no server-side validation is included.
- Clipboard access may be blocked by browser permissions or when the page is not in a secure context.
- Future extensions could add an optional passphrase generator, localization, and a privacy-preserving breached-password check using a k-anonymity protocol.

## College report feature list

1. Client-side, real-time password assessment.
2. Strength meter with numeric score and descriptive categories.
3. Character and pattern requirements checklist.
4. Contextual recommendations for improving passwords.
5. Configurable password generation using Web Crypto.
6. Show/hide, clear, and clipboard controls.
7. Responsive and accessible user interface.
8. Local-only processing and security education.
