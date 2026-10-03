# App architecture

- Compose the single-page restaurant experience at the index route using the attached Bottega components and canonical CSS; preserve the library-owned appearance.
- Keep original uploaded and downloaded media in CDN pointer imports; do not embed raw binary copies in app source.
- This initial restaurant page is presentation-only: ordering links to the original ordering service, and email requests use the restaurant address rather than pretending to save subscriptions.
- Keep offering cards aligned and animate their wrappers with scroll-linked sequential reveals inside a pinned (sticky) track on desktop so the section holds until all cards land; rise and fall track scroll position and reverse; preserve library component appearance and respect reduced motion so updates remain compatible and content stays accessible.
- Use a wrapper layout for the overlapping club ribbon; library components retain their own appearance so design-system updates remain compatible.
- Keep the real menu in a dedicated /menu route with source-derived structured data and individual illustrative image imports; home menu actions use a TanStack createLink wrapper around LinkAction without editing vendor components.
- Compose both page headers through BottegaHeader using the library's separate mark and wordmark variants and router-aware LinkAction navigation so branding and navigation remain consistent.
- Mark up footer contact details (locations, email, phone, social link) with HTML5 address elements and reset their UA italic in the footer style layer so contact info stays semantic and legible.
- Give every gallery media a Bottega tomato hairline with hover zoom and a light overlay mask, and drive the gallery video with the same custom play control pattern as the story video (never native controls); respect reduced motion.
- Keep route modules declarative and thin; compose page sections from `src/features`, reusable interface pieces from `src/components`, behavior from hooks or pure helpers, and English copy from `src/content/en` so future localization does not require presentation edits.
- Keep shared, home, and menu styling in their respective imported stylesheets, using only Bottega tokens; verify filtering, scroll math, metadata, and accessibility with Vitest.
