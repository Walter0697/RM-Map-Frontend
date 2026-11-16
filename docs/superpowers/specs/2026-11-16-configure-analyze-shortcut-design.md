# Configure Analyze Shortcut Design

## Goal

Keep `Configure Roroadmap Analyze` usable after iOS leaves the PWA to install the shortcut, and make the download/configuration actions visually consistent.

## Design

The settings page will keep both actions in the existing setup dialog. The configure action will obtain fresh setup metadata through the existing authenticated setup endpoint whenever the dialog has no cached setup URL, then launch the shortcut using that URL. This avoids relying on React state surviving the browser-to-Shortcuts transition.

The download and configure actions will use the same full-width contained button treatment, consistent vertical spacing, and shared loading/disabled behavior. The existing shortcut artwork remains on the download action only; the configure action remains text-labelled.

## Verification

Add a regression test for setup metadata retrieval when configuration is requested without a cached URL, and run the focused shortcut tests plus the frontend build.
