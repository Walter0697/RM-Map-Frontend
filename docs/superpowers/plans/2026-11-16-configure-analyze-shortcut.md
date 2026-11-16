# Configure Analyze Shortcut Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep Analyze Shortcut configuration available after the PWA loses in-memory state during iOS shortcut installation and give the setup actions a consistent visual style.

**Architecture:** Reuse the existing authenticated setup endpoint and shortcut URL builder. Move the fetch-on-demand behavior into the settings page handler, preserving cached metadata when available and fetching only when configuration needs it.

**Tech Stack:** React, Material UI, Jest, Create React App.

## Global Constraints

- Preserve the shortcut name `Roroadmap Analyze`.
- Do not change the legacy Telegram shortcut flow.
- Do not expose or persist API keys in frontend state beyond the existing setup response.

---

### Task 1: Make configuration resilient to lost state

**Files:**
- Modify: `src/pages/SettingPage.js`
- Test: `src/pages/socialMediaShortcut.test.js`

**Interfaces:**
- Consumes: `requestSocialMediaShortcutSetup(fetch, setupURL, jwt)` and `buildSocialMediaShortcutLaunchURL(setupURL)`.
- Produces: configuration behavior that fetches setup metadata when `shortcutSetupURL` is empty.

- [ ] **Step 1: Add the failing setup-on-demand test**

Add a test that calls the existing setup request helper with an authenticated request and verifies the returned `setup_url` is usable for configuration when no cached URL exists.

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run:

```bash
yarn test src/pages/socialMediaShortcut.test.js --watchAll=false
```

Expected: the new behavior assertion fails before the handler change.

- [ ] **Step 3: Implement the minimal handler change**

Change `configureIOSShortcut` to be asynchronous. If there is no cached `shortcutSetupURL`, call `requestSocialMediaShortcutSetup` with the authenticated session, save the returned setup URL, and launch using it. Reuse the existing loading and error state so the action remains disabled only while the request is active.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
yarn test src/pages/socialMediaShortcut.test.js --watchAll=false
```

Expected: PASS.

### Task 2: Normalize setup action styling

**Files:**
- Modify: `src/pages/SettingPage.js`

**Interfaces:**
- Consumes: the existing download and configure handlers.
- Produces: two consistently sized and spaced setup actions in the existing dialog.

- [ ] **Step 1: Apply the shared action layout**

Use the same full-width button container, vertical spacing, contained variant, and minimum height for Download and Configure. Preserve the download icon artwork and text while making its button dimensions match Configure.

- [ ] **Step 2: Run the focused tests**

Run:

```bash
yarn test src/pages/socialMediaShortcut.test.js --watchAll=false
```

Expected: PASS.

- [ ] **Step 3: Run the production build**

Run:

```bash
yarn build
```

Expected: the frontend production build completes successfully.

- [ ] **Step 4: Commit the implementation**

```bash
git add src/pages/SettingPage.js src/pages/socialMediaShortcut.test.js docs/superpowers/specs/2026-11-16-configure-analyze-shortcut-design.md docs/superpowers/plans/2026-11-16-configure-analyze-shortcut.md
git commit -m "fix: keep analyze shortcut configuration available"
```
