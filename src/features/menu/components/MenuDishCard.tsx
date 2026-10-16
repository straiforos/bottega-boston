import type { ReactNode } from 'react';
import { Card, Display, PillLabel, Serif } from '@/design-system/bottega-f5161c';
import { menuImages } from '@/lib/menu-images';
import type { MenuItem } from '@/lib/menu/types';

export function MenuDishCard({ item, actions }: { item: MenuItem; actions?: ReactNode }) {
  const image = item.imageUrl ?? menuImages[item.id];
  return (
    <article className="menu-dish-item">
      {image && <img src={image} alt={`Illustrative ${item.name}`} loading="lazy" width={480} height={480} />}
      <Card variant="cream" shape="rect">
        <div className="menu-dish-heading">
          <Display as="h3" size="sm" tone="forest">
            {item.name}
          </Display>
          {item.price && (
            <Serif as="p" size="sm" tone="forest">
              {item.price}
            </Serif>
          )}
        </div>
        {item.tags.length > 0 && (
          <div className="menu-dietary-tags">
            {item.tags.map((tag) => (
              <PillLabel key={tag} variant="chip-forest">
                {tag}
              </PillLabel>
            ))}
          </div>
        )}
        {item.description && (
          <div className="menu-item-description">
            {item.description
              .split('\n')
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>
        )}
        {actions}
      </Card>
    </article>
  );
}
