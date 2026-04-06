import mongoose, { Schema, Document, Model } from "mongoose";

/* ── Auto-increment counter ────────────────────────────────── */
const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

export async function getNextId(name: string): Promise<number> {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

export async function syncCounters(): Promise<void> {
  // Wait to avoid import order issues with the models below
  const collections = [
    { model: mongoose.models.Restaurant, name: "restaurant" },
    { model: mongoose.models.Category, name: "category" },
    { model: mongoose.models.MenuItem, name: "menuItem" },
    { model: mongoose.models.Offer, name: "offer" }
  ];

  for (const { model, name } of collections) {
    if (!model) continue;
    const highest: any = await model.findOne().sort({ id: -1 }).select("id").lean();
    const maxId = highest?.id || 0;
    await Counter.findByIdAndUpdate(name, { $set: { seq: maxId } }, { upsert: true });
    console.log(`[DB] Synced counter '${name}' to ${maxId}`);
  }
}



/* ── Restaurant ──────────────────────────────────────────────── */
export interface IRestaurant extends Document {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
  primaryColor: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    id:           { type: Number, required: true, unique: true },
    name:         { type: String, required: true },
    slug:         { type: String, required: true, unique: true },
    description:  { type: String, default: null },
    logoUrl:      { type: String, default: null },
    phone:        { type: String, default: null },
    address:      { type: String, default: null },
    primaryColor: { type: String, default: null },
  },
  { timestamps: true }
);

export const Restaurant: Model<IRestaurant> =
  mongoose.models.Restaurant || mongoose.model<IRestaurant>("Restaurant", restaurantSchema);

/* ── Category ────────────────────────────────────────────────── */
export interface ICategory extends Document {
  id: number;
  restaurantId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    id:           { type: Number, required: true, unique: true },
    restaurantId: { type: Number, required: true, index: true },
    name:         { type: String, required: true },
    description:  { type: String, default: null },
    imageUrl:     { type: String, default: null },
    sortOrder:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

/* ── MenuItem ────────────────────────────────────────────────── */
export interface IMenuItem extends Document {
  id: number;
  restaurantId: number;
  categoryId: number | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  type: string;
  isCombo: boolean;
  comboItemCount: number | null;
  isSpicy: boolean;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    id:             { type: Number, required: true, unique: true },
    restaurantId:   { type: Number, required: true, index: true },
    categoryId:     { type: Number, default: null },
    name:           { type: String, required: true },
    description:    { type: String, default: null },
    price:          { type: Number, required: true },
    imageUrl:       { type: String, default: null },
    type:           { type: String, default: "veg" },
    isCombo:        { type: Boolean, default: false },
    comboItemCount: { type: Number, default: null },
    isSpicy:        { type: Boolean, default: false },
    isAvailable:    { type: Boolean, default: true },
    sortOrder:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", menuItemSchema);

/* ── Offer ───────────────────────────────────────────────────── */
export interface IOffer extends Document {
  id: number;
  restaurantId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  discountPercent: number | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    id:              { type: Number, required: true, unique: true },
    restaurantId:    { type: Number, required: true, index: true },
    title:           { type: String, required: true },
    description:     { type: String, default: null },
    imageUrl:        { type: String, default: null },
    discountPercent: { type: Number, default: null },
    validUntil:      { type: String, default: null },
    isActive:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>("Offer", offerSchema);
