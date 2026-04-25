# TES-0017 - Add grid view for /markers

## Summary

Add a toggle on the `/markers` list face so users can switch between the current list layout and a new grid layout.

## Problem

The markers page currently presents list mode in a single vertical column only. This makes image-heavy browsing slower when users want to scan many markers quickly.

## Proposal

- Keep the existing list renderer as the default behavior.
- Add a local list/grid toggle in the markers list UI.
- Introduce a responsive grid card optimized for browsing marker images and summary metadata.
- Preserve marker selection, pagination, retry, stale/offline messaging, and top refresh behavior in both layouts.
- Keep history preview markers readable by rendering them with the existing row-style card in grid mode.

## Acceptance Criteria

- `/markers` list mode exposes controls for both list and grid layouts.
- Grid mode renders markers in a responsive multi-column layout on larger screens and a single column on smaller screens.
- Clicking any marker in grid mode opens the same marker details flow as list mode.
- Existing paging and refresh behaviors continue to function.
