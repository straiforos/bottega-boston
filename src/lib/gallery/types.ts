export interface MediaVersion {
  readonly key: string;
  readonly url: string;
  readonly width: number;
}

export interface GalleryItem {
  readonly id: string;
  readonly type: 'image' | 'video';
  /** Default playable/viewable URL. */
  readonly url: string;
  readonly poster?: string | null;
  /** Sized versions: photos thumb/standard/hq, videos small/standard/hq. */
  readonly versions: readonly MediaVersion[];
  readonly alt: string;
  readonly caption: string;
  readonly sortOrder: number;
}

export interface TileDraft {
  readonly alt: string;
  readonly caption: string;
}
