import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }),
  validUntil: text("valid_until"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
