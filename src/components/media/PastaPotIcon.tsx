import pastaPotMarkup from '@/assets/pasta-pot.svg?raw';

/** Hand-drawn pasta in a pot sketch, tinted with the Bottega mustard accent. */
export function PastaPotIcon() {
  return <span className="pasta-pot-icon" dangerouslySetInnerHTML={{ __html: pastaPotMarkup }} />;
}
