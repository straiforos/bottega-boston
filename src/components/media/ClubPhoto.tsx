import pasta from '@/assets/pasta-club.asset.json';

export function ClubPhoto() {
  return (
    <div className="club-media">
      <img className="club-photo" src={pasta.url} alt="Pasta Club is always a good idea" loading="lazy" />
    </div>
  );
}
