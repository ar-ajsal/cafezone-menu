import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const restaurantsTable = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  phone: text("phone"),
  address: text("address"),
  primaryColor: text("primary_color"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRestaurantSchema = createInsertSchema(restaurantsTable).omit({ id: true, createdAt: true });
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurantsTable.$inferSelect;
