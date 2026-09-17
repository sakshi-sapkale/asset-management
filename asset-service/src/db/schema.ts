import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const assets = pgTable('assets', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),

  name: varchar('name', { length: 255 }).notNull(),

  description: text('description'),

  assetTag: varchar('asset_tag', { length: 100 })
    .notNull()
    .unique(),

  status: varchar('status', { length: 50 })
    .notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  }).defaultNow().notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  }).defaultNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;