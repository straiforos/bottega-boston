import { PillLabel } from '@/design-system/bottega-f5161c';
import { GalleryVideo } from '@/components/media/GalleryVideo';
import socialVideo from '@/assets/social-video.asset.json';
import social1 from '@/assets/social-1.asset.json';
import social2 from '@/assets/social-2.asset.json';
import social3 from '@/assets/social-3.asset.json';

const images = [
  { asset: social1, alt: 'Enjoying a sweet treat at Bottega', caption: 'La dolce vita' },
  { asset: social2, alt: 'A Bottega guest sharing a plate of pasta', caption: '#pastaislife' },
  { asset: social3, alt: 'Coffee and a little work at Bottega', caption: 'Caffè, always' },
] as const;

export function SocialSection() {
  return (
    <section className="social-section">
      <div className="gallery">
        <figure className="gallery-item">
          <GalleryVideo src={socialVideo.url} />
        </figure>
        {images.map(({ asset, alt, caption }) => (
          <figure className="gallery-item" key={asset.asset_id}>
            <img src={asset.url} loading="lazy" alt={alt} />
            <figcaption>
              <PillLabel variant="mustard">{caption}</PillLabel>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
