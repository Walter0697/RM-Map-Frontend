# RRM-0025 Desktop Web UX Validation

## Scoped Pages

- `/home`
- `/schedule`
- `/setting`

## Supported Viewports

- Mobile parity baseline: `390px` (validated against locked mobile contract)
- Desktop contract validation: `1280px` (must satisfy desktop spacing/width affordances)

## Mobile No-Change Checklist

- [x] `src/pages/Base.js` desktop layout styles are only applied when `desktopPageKey` maps to a scoped page.
- [x] `src/styles/bottom.module.css` desktop spacing/width rules are wrapped by `@media (min-width: 1024px)`.
- [x] `src/index.css` hover/focus affordances are wrapped by desktop + fine-pointer media query constraints.
- [x] `src/testing/layout/desktopLayoutRegression.test.js` asserts fixed mobile baseline contract values.
- [x] `src/testing/layout/desktopLayoutRegression.test.js` verifies desktop scoped styles are media-query gated.

## Manual QA Notes

- Pending manual QA execution for `/home`, `/schedule`, and `/setting` on representative desktop/mobile devices.
- Automated guardrails currently verify mobile parity contract values and desktop media-query scoping.
- Keyboard focus visibility is covered by desktop CSS rule assertions and still requires interactive manual pass.

## Residual Defects

- None observed during this pass.
