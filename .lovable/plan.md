# Bottega code quality refactor

## Goal
Restructure the existing home and menu experiences into readable, testable feature modules without changing their visual design, copy, routes, menu inventory, or custom interactions. Prepare all visible content for future localization while keeping English as the only active language.

## 1. Establish quality gates
- Add Prettier with shared formatting and check scripts so JSX, TypeScript, JSON, and CSS have consistent diffs.
- Strengthen ESLint by restoring unused-code checks and adding accessibility checks appropriate for React.
- Add dedicated typecheck and combined quality scripts.
- Add Vitest, Testing Library, jsdom, and accessibility assertions for fast automated tests.
- Keep browser-level coverage focused on behavior that requires a real layout engine rather than building a large end-to-end suite.

## 2. Reorganize by feature
- Keep route files thin: route declaration, route-specific metadata, and one page component reference.
- Move home composition into `features/home`, with focused sections for the welcome image, story/video, menu introduction, animated offering cards, events, gallery, and Pasta Club signup.
- Move menu composition into `features/menu`, with focused filter, category, and dish-card components.
- Keep cross-page pieces under shared app components: header, footer, video controls, moving ribbon, and restaurant sketches.
- Leave generated preview infrastructure, attached design-system source, media pointers, and generated route tree untouched.

## 3. Isolate behavior from presentation
- Extract reusable media state into a shared video hook/component while preserving autoplay, hover playback, pause visibility, sound control, and reduced-motion behavior.
- Extract the pinned card sequence into a focused hook plus pure progress calculations; preserve the dramatic one-by-one forward and reverse scroll effect.
- Extract menu filtering/counting into pure functions and a small state hook.
- Extract reduced-motion detection once and reuse it across ribbons, videos, and card motion.
- Replace dense inline handlers and one-line JSX with named functions and readable composition.

## 4. Centralize content and formatting
- Create a typed English content catalog for navigation, controls, section copy, accessibility labels, metadata, footer details, links, addresses, hours, and legal labels.
- Keep Italian brand phrases as intentional content, not translated interface strings.
- Centralize restaurant contact details and external URLs so they have one source of truth.
- Give menu sections/items explicit TypeScript types and a stable data-access layer.
- Preserve current displayed menu prices exactly in this pass; add locale-aware currency helpers only where prices can be normalized without losing size/options text.
- Keep `lang="en"` and ship no language switcher yet; the structure will allow another locale to be added later without rewriting components.

## 5. Organize styling without redesigning
- Split the large app stylesheet into feature-level style files imported through one app stylesheet, while keeping every existing Bottega token and intentional visual exception.
- Group selectors by component/section, remove stale selectors, and document the few deliberate design-system deviations required by the approved hero, sticky header, and video-control behavior.
- Do not edit or re-skin vendor-owned Bottega components.

## 6. Add regression coverage
- Unit-test menu search, category filtering, result counts, catering grouping, and reset behavior.
- Unit-test scroll progress math, sequence staggering, reverse behavior, and reduced-motion fallback.
- Component-test video play/pause, autoplay state, hover playback, sound labels, and rejected playback promises.
- Component-test shared navigation, sticky header state, footer variants, accessibility labels, and empty menu results.
- Add accessibility smoke tests for the home and menu pages.
- Add browser checks for desktop pinned-card motion, reverse scrolling, reduced motion, mobile layout, gallery hover playback, and navigation across `/` and `/menu`.
- Verify route metadata remains unique and complete.

## 7. Final cleanup and documentation
- Update the architecture rules to describe feature boundaries, content ownership, and testing expectations.
- Replace the current roadmap item with clear completed checks and retain external blockers separately.
- Run formatting, linting, typechecking, unit tests, browser checks, and the preview build; resolve regressions before completion.

## Target structure
```text
src/
  components/
    BottegaHeader.tsx
    SiteFooter.tsx
    media/
    brand/
  content/
    en/
    restaurant.ts
    links.ts
  features/
    home/
      HomePage.tsx
      sections/
      hooks/
      home.css
    menu/
      MenuPage.tsx
      components/
      hooks/
      menu.css
  hooks/
  lib/
    menu/
    motion/
  routes/
    index.tsx
    menu.tsx
  styles.css
```

## Constraints
- No visual redesign or copy rewrite.
- No backend, subscription service, or event-management work.
- English remains the only enabled locale.
- The incomplete responsive-header attachment remains a separate design-system sync blocker; this refactor will not recreate vendor components locally.
