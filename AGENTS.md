# App architecture

- Compose the single-page restaurant experience at the index route using the attached Bottega components and canonical CSS; preserve the library-owned appearance.
- Keep original uploaded and downloaded media in CDN pointer imports; do not embed raw binary copies in app source.
- This initial restaurant page is presentation-only: ordering links to the original ordering service, and email requests use the restaurant address rather than pretending to save subscriptions.
- Use wrapper layouts for staggered library cards and the overlapping club ribbon; library components retain their own appearance so design-system updates remain compatible.