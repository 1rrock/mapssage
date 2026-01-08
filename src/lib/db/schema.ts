import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name'),
  email: text('email'),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  image: text('image'),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const sessions = sqliteTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const traces = sqliteTable('traces', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  
  title: text('title').notNull(),
  content: text('content'),
  imageUrl: text('image_url'),
  
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => ({
  locationIdx: index('idx_traces_location').on(table.latitude, table.longitude),
  userIdx: index('idx_traces_user').on(table.userId),
}));

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  traceId: text('trace_id')
    .references(() => traces.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  parentId: text('parent_id'),
  content: text('content').notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => ({
  traceIdx: index('idx_comments_trace').on(table.traceId),
  parentIdx: index('idx_comments_parent').on(table.parentId),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Trace = typeof traces.$inferSelect;
export type NewTrace = typeof traces.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
