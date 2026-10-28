import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const now = sql`(datetime('now'))`;

export const staffAllowlist = sqliteTable('staff_allowlist', {
  email: text('email').primaryKey(),
  createdAt: text('created_at').notNull().default(now),
});

export const menuSections = sqliteTable('menu_sections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  note: text('note').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const menuItems = sqliteTable(
  'menu_items',
  {
    id: text('id').primaryKey(),
    sectionId: text('section_id')
      .notNull()
      .references(() => menuSections.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    price: text('price').notNull().default(''),
    description: text('description').notNull().default(''),
    tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default([]),
    imageUrl: text('image_url'),
    imageVariants: text('image_variants', { mode: 'json' }).$type<unknown>(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: text('updated_at').notNull().default(now),
  },
  (t) => [index('menu_items_section_idx').on(t.sectionId, t.sortOrder)],
);

export const galleryItems = sqliteTable('gallery_items', {
  id: text('id').primaryKey(),
  mediaType: text('media_type').notNull().default('image'),
  assetKey: text('asset_key'),
  mediaUrl: text('media_url'),
  posterUrl: text('poster_url'),
  variants: text('variants', { mode: 'json' }).$type<unknown>(),
  alt: text('alt').notNull().default(''),
  caption: text('caption').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: text('updated_at').notNull().default(now),
});

export const clubSubscribers = sqliteTable('club_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  consentAt: text('consent_at').notNull().default(now),
  unsubscribeToken: text('unsubscribe_token').notNull().unique(),
  unsubscribedAt: text('unsubscribed_at'),
  welcomeSentAt: text('welcome_sent_at'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull().default(now),
});

export const emailTemplates = sqliteTable('email_templates', {
  key: text('key').primaryKey(),
  subject: text('subject').notNull().default(''),
  preheader: text('preheader').notNull().default(''),
  blocks: text('blocks', { mode: 'json' }).$type<unknown>().notNull().default([]),
  kind: text('kind').notNull().default('newsletter'),
  name: text('name').notNull().default(''),
  variables: text('variables', { mode: 'json' }).$type<string[]>().notNull().default([]),
  updatedAt: text('updated_at').notNull().default(now),
});

export const emailCampaigns = sqliteTable('email_campaigns', {
  id: text('id').primaryKey(),
  subject: text('subject').notNull(),
  preheader: text('preheader').notNull().default(''),
  blocks: text('blocks', { mode: 'json' }).$type<unknown>().notNull().default([]),
  recipientCount: integer('recipient_count').notNull().default(0),
  failedCount: integer('failed_count').notNull().default(0),
  sentBy: text('sent_by'),
  sentAt: text('sent_at'),
  status: text('status').notNull().default('sent'),
  scheduledFor: text('scheduled_for'),
  updatedAt: text('updated_at').notNull().default(now),
});

export const emailSends = sqliteTable(
  'email_sends',
  {
    id: text('id').primaryKey(),
    campaignId: text('campaign_id').references(() => emailCampaigns.id, { onDelete: 'cascade' }),
    subscriberId: text('subscriber_id').references(() => clubSubscribers.id, { onDelete: 'set null' }),
    templateKey: text('template_key'),
    email: text('email').notNull(),
    resendId: text('resend_id').unique(),
    status: text('status').notNull().default('sent'),
    openedAt: text('opened_at'),
    clickedAt: text('clicked_at'),
    createdAt: text('created_at').notNull().default(now),
  },
  (t) => [index('email_sends_campaign_idx').on(t.campaignId)],
);

export const emailEvents = sqliteTable(
  'email_events',
  {
    id: text('id').primaryKey(),
    deliveryId: text('delivery_id').notNull().unique(),
    resendId: text('resend_id').notNull(),
    type: text('type').notNull(),
    url: text('url'),
    occurredAt: text('occurred_at').notNull().default(now),
    createdAt: text('created_at').notNull().default(now),
  },
  (t) => [index('email_events_resend_idx').on(t.resendId)],
);

export const homeContent = sqliteTable('home_content', {
  key: text('key').primaryKey(),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: text('updated_at').notNull().default(now),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  locationId: text('location_id').notNull().default('brookline'),
  locations: text('locations', { mode: 'json' }).$type<string[]>().notNull().default([]),
  imageUrl: text('image_url'),
  startsAt: text('starts_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(120),
  ticketUrl: text('ticket_url'),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  recurrence: text('recurrence', { mode: 'json' }).$type<unknown>(),
  timezone: text('timezone').notNull().default('America/New_York'),
  createdAt: text('created_at').notNull().default(now),
  updatedAt: text('updated_at').notNull().default(now),
});

export const eventExceptions = sqliteTable(
  'event_exceptions',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    occurrenceDate: text('occurrence_date').notNull(),
    skipped: integer('skipped', { mode: 'boolean' }).notNull().default(false),
    startTime: text('start_time'),
    ticketUrl: text('ticket_url'),
  },
  (t) => [uniqueIndex('event_exceptions_event_date').on(t.eventId, t.occurrenceDate)],
);

export const eventRequests = sqliteTable(
  'event_requests',
  {
    id: text('id').primaryKey(),
    kind: text('kind').notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull().default(''),
    locationId: text('location_id').notNull().default(''),
    requestedFor: text('requested_for').notNull(),
    guests: integer('guests'),
    eventType: text('event_type').notNull().default(''),
    fulfillment: text('fulfillment').notNull().default(''),
    address: text('address').notNull().default(''),
    dietary: text('dietary').notNull().default(''),
    notes: text('notes').notNull().default(''),
    orderLines: text('order_lines', { mode: 'json' }).$type<unknown>().notNull().default([]),
    status: text('status').notNull().default('new'),
    staffNotes: text('staff_notes').notNull().default(''),
    createdAt: text('created_at').notNull().default(now),
    updatedAt: text('updated_at').notNull().default(now),
  },
  (t) => [index('event_requests_email_created_idx').on(t.email, t.createdAt)],
);
