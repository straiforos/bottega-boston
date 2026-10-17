# Bottega roadmap

- [x] Consolidate welcome banners with alternating pasta/lemon icons, keep Pasta Is Life as a marquee, place the matching wave between story and menu, and merge the menu introduction into the animated cards section.

- [x] Build the scrolling restaurant page using the supplied original images and copy.
- [x] Add original video, scrolling banners, menu panels, social gallery, and contact footer.
- [x] Verify desktop and mobile layout and page controls.
- [x] Match reference composition: aligned cards with sequential scroll reveals, green club with overlapping ribbon and larger woman, seamless gallery, styled video.
- [ ] Events (incl. recurring), Ticket Tailor tickets, catering + event space requests with staff inbox (in progress)
- [x] Add the real menu on its own searchable page with illustrative images, all prices and options, and replace the sample menu links.
- [x] Share the home and menu header with official logo and name variants and bold colored navigation links.
- [x] Use the Bottega responsive MenuToggle and MenuOverlay in the shared header.
- [x] Restructure the project into maintainable features, shared components, centralized English content, focused style sheets, and tested pure behavior.
- [x] Trim the events section: drop the "Good food. Better company." intro line and the "no events" note, leaving the "Come hang out with us." heading under the red ribbon.
- [x] Close the desktop gap between the menu cards and events: pinned panel now exactly one screen tall, pinned run shortened to 2.2 screens, and the reveal stretched so the last card lands as the section releases.
- [x] Enlarge the Pasta Club photo and align its top with the gallery edge: componentize the photo, keep the "Follow us" ribbon behind her face.
- [x] On mobile, lift the Pasta Club photo to the section top so the "Follow us" wave passes behind her head (desktop unchanged).
- [x] Style the story video captions: browser captions hidden, smaller mustard pill overlay kept clear of the "About us" pill, and a CC toggle button beside the sound toggle.
- [x] On mobile, left-align the "About us" pill so the CC and sound controls stay clear of it.
- [x] On mobile, tighten the gap between the "Family is life" ribbon and the menu heading.
- [x] Drop the period from the menu heading and move the pasta-pot sketch in front of the word.
- [x] Remove the "A tavola, with love" label above the "Bottega Pasta Club." heading.
- [x] Photo uploads up to 100 MB; browser-processed thumbnail / 5 MB standard / 50 MB high-quality versions chosen by connection speed
- [x] Menu admin buttons: Edit uses primary style, Delete is red
- [x] Footer shared by all pages through the _site layout route (no compact variant)
- [x] Menu filter floats vertically centered in the left rail while scrolling, clear of the sticky header
- [x] Remove the "Illustrative images" disclaimer from the menu page heading (and its dead CSS)
- [x] Show the Dietary options as a vertical list instead of a wrapping row (menu page filter and dish editor)
- [x] Give the shared header extra top padding so the logo mark sits centered in the bar instead of crowded against the top

- Menu filter rail: top-aligned at page top, glides to vertical center while scrolling (desktop); scroll math in filter-rail-offset.ts + tests, driven by useMenuFilterRail.
- [x] Inline gallery editing for staff on the home page (edit/add/delete/reorder photos and videos)
- [x] Background in-browser (WebAssembly) processing of gallery photos and videos into small/standard/high-quality versions, with connection-aware video sources, covers and lazy loading
- [x] Gallery is one sideways-scrolling row with arrow buttons (no wrapping)
- [x] Integrate gallery editing: in-tile controls and a trailing add slot, with unchanged gallery height; verified staff save/read-back, add/cancel, and touch controls.
- [x] Gallery move and scroll arrows use a solid arrow shape in the design system's filled button style so they read clearly
- [x] Pasta Club signup saves subscribers and sends an automatic welcome email (Resend)
- [x] Staff email editor on its own page: block-based WYSIWYG with live preview, test send, send to all, editable welcome email, CSV export, unsubscribe
- [ ] Verify a sending domain in Resend so emails reach all guests (waiting on the restaurant)
- [x] Favicon: cream version served to dark-mode browsers, dark version kept for light-mode
- [x] Drop the "Pasta Club emails" ribbon from the home page (header "Editing" marquee covers it); subscriber count, welcome-email switch and CSV export now live in the email editor toolbar
- [x] Order now jumps to a Locations section on the home page (maps, addresses, staff-editable ordering links)
- [x] Use canonical BottegaMap with geocoded pins and connect Google Maps; live rendering requires checking on the authorized site.

- [x] Dark-green Locations section with built-in map inset cards containing addresses and Order now links; verified cards and destinations locally (map rendering requires authorized host).
