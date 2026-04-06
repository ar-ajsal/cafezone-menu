import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  categoryId: integer("category_id"),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  type: text("type").notNull().default("veg"), // veg, non-veg, beverage
  isCombo: boolean("is_combo").notNull().default(false),
  comboItemCount: integer("combo_item_count"),
  isSpicy: boolean("is_spicy").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertMenuItemSchema = createInsertSchema(menuItemsTable).omit({ id: true });
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItemsTable.$inferSelect;
