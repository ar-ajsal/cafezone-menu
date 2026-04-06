// seed.mjs — Cafe Zone Bake & Cafe full menu seed
import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("MONGODB_URI not set"); process.exit(1); }

/* ── Schemas ── */
const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.model("Counter", counterSchema);

const restaurantSchema = new mongoose.Schema({ id: Number, name: String, slug: String, description: String, logoUrl: String, phone: String, address: String, primaryColor: String }, { timestamps: true });
const Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);

const categorySchema = new mongoose.Schema({ id: Number, restaurantId: Number, name: String, description: String, imageUrl: String, sortOrder: Number }, { timestamps: true });
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

const menuItemSchema = new mongoose.Schema({ id: Number, restaurantId: Number, categoryId: Number, name: String, description: String, price: Number, imageUrl: String, type: String, isCombo: Boolean, comboItemCount: Number, isSpicy: Boolean, isAvailable: Boolean, sortOrder: Number }, { timestamps: true });
const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);

const offerSchema = new mongoose.Schema({ id: Number, restaurantId: Number, title: String, description: String, imageUrl: String, discountPercent: Number, validUntil: String, isActive: Boolean }, { timestamps: true });
const Offer = mongoose.models.Offer || mongoose.model("Offer", offerSchema);

async function nextId(name) {
  const doc = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return doc.seq;
}

/* ── Data ─────────────────────────────────────────────────────── */

const RESTAURANT = {
  name: "Cafe Zone",
  slug: "cafe-zone-kumbla",
  description: "Bake & Cafe — Main Junction, Badiadka Road, Kumbla",
  phone: "7907606991, 9995183965, 9746214344",
  address: "Main Junction, Badiadka Road, KUMBLA",
  primaryColor: "#e85d04",
  logoUrl: null,
};

// Unsplash images per category (representative)
const CAT_IMAGES = {
  "Starters":          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=120&h=120&fit=crop&q=80",
  "Club Sandwich":     "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=120&h=120&fit=crop&q=80",
  "Combos":            "https://images.unsplash.com/photo-1562967914-608f82629710?w=120&h=120&fit=crop&q=80",
  "Fresh Juice":       "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=120&h=120&fit=crop&q=80",
  "Fresh Lime":        "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=120&h=120&fit=crop&q=80",
  "Mojito":            "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=120&h=120&fit=crop&q=80",
  "Milk Shake":        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=120&h=120&fit=crop&q=80",
  "Falooda":           "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=120&h=120&fit=crop&q=80",
  "Cafe Zone Special": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=120&h=120&fit=crop&q=80",
  "Tortilla Wrap":     "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=120&h=120&fit=crop&q=80",
  "Roll":              "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&h=120&fit=crop&q=80",
  "Ice Cream Shake":   "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=120&h=120&fit=crop&q=80",
  "Avil Milk":         "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&h=120&fit=crop&q=80",
  "Burger":            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop&q=80",
};

// [name, price, type, isCombo, isSpicy, description]
const ITEMS_BY_CATEGORY = {
  "Starters": [
    { name: "French Fries", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Potato Wedges", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Spicy Fries", price: 70, type: "veg", isCombo: false, isSpicy: true },
    { name: "Nuggets", price: 100, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Momos", price: 100, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Chicken Pop", price: 120, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Peri Peri Momos", price: 120, type: "non-veg", isCombo: false, isSpicy: true },
    { name: "Chicken Strips", price: 140, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Loaded Fries", price: 200, type: "veg", isCombo: false, isSpicy: false },
    { name: "Hollywood Fries", price: 220, type: "veg", isCombo: false, isSpicy: false },
    { name: "Chicken Stick", price: 120, type: "non-veg", isCombo: false, isSpicy: false },
  ],
  "Club Sandwich": [
    { name: "Veg Sandwich", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Chicken Club Sandwich", price: 160, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Crispy Chicken Sandwich", price: 160, type: "non-veg", isCombo: false, isSpicy: true },
    { name: "Chicken Panini Sandwich", price: 160, type: "non-veg", isCombo: false, isSpicy: false },
  ],
  "Solo / Combo Meals": [
    { name: "Solo Meal", price: 110, type: "non-veg", isCombo: true, isSpicy: false, description: "1 Pc Chicken, 1 Bun, Mayonnaise, Ketchup, 250 ml Drink Or Fresh Lime" },
    { name: "Duo", price: 220, type: "non-veg", isCombo: true, isSpicy: false, description: "2 Pc Chicken, 2 Bun, Mayonnaise, Ketchup, 250 ml Drink Or Fresh Lime" },
    { name: "Kids Pack", price: 240, type: "non-veg", isCombo: true, isSpicy: false, description: "1 Pc Chicken, 1 Mini Burger, French Fries, Oreo Shake" },
    { name: "Friends Combo", price: 360, type: "non-veg", isCombo: true, isSpicy: false, description: "4 Pc Chicken, 2 Bun, Mayonnaise, Ketchup" },
    { name: "Friends Combo (Large)", price: 550, type: "non-veg", isCombo: true, isSpicy: false, description: "6 Pc Chicken, 4 Bun, 2 Mayonnaise, Ketchup, French Fries, 750 ml Drink" },
    { name: "Super Combo", price: 800, type: "non-veg", isCombo: true, isSpicy: false, description: "9 Pc Chicken, 5 Bun, 3 Mayonnaise, French Fries, 1.25 L Soft Drink" },
    { name: "Family Combo", price: 1100, type: "non-veg", isCombo: true, isSpicy: false, description: "12 Pc Chicken, 6 Bun, 3 Mayonnaise, French Fries, 2 L Drink" },
    { name: "Jumbo Combo", price: 1300, type: "non-veg", isCombo: true, isSpicy: false, description: "15 Pc Chicken, 8 Bun, 3 Mayonnaise, French Fries, 2 L Drink" },
    { name: "Super Party Combo", price: 1700, type: "non-veg", isCombo: true, isSpicy: false, description: "20 Pc Chicken, 12 Bun, 4 Mayonnaise, French Fries, 2 L Drink" },
    { name: "Party Combo", price: 1599, type: "non-veg", isCombo: true, isSpicy: false, description: "25 Pc Chicken" },
  ],
  "Add-Ons": [
    { name: "Chicken", price: 90, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Bun", price: 6, type: "veg", isCombo: false, isSpicy: false },
    { name: "Mayonnaise", price: 40, type: "veg", isCombo: false, isSpicy: false },
  ],
  "Fresh Juice": [
    { name: "Orange Juice", price: 60, type: "veg", isCombo: false, isSpicy: false },
    { name: "Musambi Juice", price: 60, type: "veg", isCombo: false, isSpicy: false },
    { name: "Grape Juice", price: 50, type: "veg", isCombo: false, isSpicy: false },
    { name: "Pineapple Juice", price: 60, type: "veg", isCombo: false, isSpicy: false },
    { name: "Pappaya Juice", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Mango Juice", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Carrot Juice", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Shamam Juice", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Anar Juice", price: 80, type: "veg", isCombo: false, isSpicy: false },
  ],
  "Fresh Lime": [
    { name: "Soda Lime", price: 30, type: "veg", isCombo: false, isSpicy: false },
    { name: "Fresh Lime", price: 30, type: "veg", isCombo: false, isSpicy: false },
    { name: "Mint Lime", price: 30, type: "veg", isCombo: false, isSpicy: false },
    { name: "Ginger Lime", price: 40, type: "veg", isCombo: false, isSpicy: false },
    { name: "Grape Lime", price: 40, type: "veg", isCombo: false, isSpicy: false },
    { name: "Pineapple Lime", price: 40, type: "veg", isCombo: false, isSpicy: false },
    { name: "Blue Lime", price: 30, type: "veg", isCombo: false, isSpicy: false },
    { name: "Tender Lime", price: 40, type: "veg", isCombo: false, isSpicy: false },
  ],
  "Mojito": [
    { name: "Mint Mojito", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Kiwi Mojito", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Watermelon Mojito", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Black Curren Mojito", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Green Apple Mojito", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Pineapple Mojito", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Strawberry Mojito", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Bubblegum with Jelly Mojito", price: 90, type: "veg", isCombo: false, isSpicy: false },
    { name: "Passion Fruit Mojito", price: 90, type: "veg", isCombo: false, isSpicy: false },
    { name: "Blueberry Mojito", price: 90, type: "veg", isCombo: false, isSpicy: false },
    { name: "Blue Curacao Mojito", price: 90, type: "veg", isCombo: false, isSpicy: false },
  ],
  "Milk Shake": [
    { name: "Dairy Milk", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "KitKat", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Cashew and Badam", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Fruit Cocktail", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Snickers", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Cashew", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Dates", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Badam", price: 90, type: "veg", isCombo: false, isSpicy: false },
    { name: "Cashew and Dates", price: 110, type: "veg", isCombo: false, isSpicy: false },
    { name: "Dry Fruits", price: 120, type: "veg", isCombo: false, isSpicy: false },
    { name: "Chikku", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Sharja", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Oreo", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Boost", price: 60, type: "veg", isCombo: false, isSpicy: false },
    { name: "Horlicks", price: 60, type: "veg", isCombo: false, isSpicy: false },
    { name: "Apple", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Anar", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Shamam", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Malabar", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Papaya", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Mango and Dates", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Tender and Cashew", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Anjeer", price: 130, type: "veg", isCombo: false, isSpicy: false },
  ],
  "Falooda": [
    { name: "Falooda Normal", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Bombay Falooda", price: 140, type: "veg", isCombo: false, isSpicy: false },
    { name: "Golden Falooda", price: 150, type: "veg", isCombo: false, isSpicy: false },
    { name: "Royal Falooda", price: 160, type: "veg", isCombo: false, isSpicy: false },
    { name: "Fruit Salad", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Fruit Salad (SP)", price: 120, type: "veg", isCombo: false, isSpicy: false },
    { name: "Mango Falooda", price: 120, type: "veg", isCombo: false, isSpicy: false },
    { name: "Arabian Falooda", price: 160, type: "veg", isCombo: false, isSpicy: false },
    { name: "Dilkhush", price: 160, type: "veg", isCombo: false, isSpicy: false },
    { name: "Gudbud", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Gudbud (SP)", price: 130, type: "veg", isCombo: false, isSpicy: false },
    { name: "Chocolate Falooda", price: 120, type: "veg", isCombo: false, isSpicy: false },
    { name: "Cafezone Special Falooda", price: 180, type: "veg", isCombo: false, isSpicy: false },
  ],
  "Cafe Zone Special": [
    { name: "Watermelon Blast", price: 220, type: "veg", isCombo: false, isSpicy: false },
    { name: "Painapple Kappal", price: 220, type: "veg", isCombo: false, isSpicy: false },
    { name: "Kannur Cocktail", price: 90, type: "veg", isCombo: false, isSpicy: false },
    { name: "Tunder Falooda", price: 220, type: "veg", isCombo: false, isSpicy: false },
  ],
  "Tortilla Wrap": [
    { name: "Seekh Kebab Wrap", price: 90, type: "non-veg", isCombo: false, isSpicy: true },
    { name: "Falafel Wrap", price: 90, type: "veg", isCombo: false, isSpicy: false },
    { name: "Classic Chicken", price: 120, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Chicken Tikka Wrap", price: 120, type: "non-veg", isCombo: false, isSpicy: true },
    { name: "Crispy Chicken", price: 140, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Barbeque Chicken", price: 140, type: "non-veg", isCombo: false, isSpicy: true },
    { name: "Zinger Wrap", price: 100, type: "non-veg", isCombo: false, isSpicy: false },
  ],
  "Roll": [
    { name: "Zinger Parotta", price: 80, type: "non-veg", isCombo: false, isSpicy: true },
    { name: "Zinger Cheese Porotta", price: 100, type: "non-veg", isCombo: false, isSpicy: true },
    { name: "Grilled Parotta", price: 80, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Shawarma (N)", price: 70, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Shawarma (SP)", price: 90, type: "non-veg", isCombo: false, isSpicy: true },
    { name: "Plate Shawarma", price: 120, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Open Roll", price: 80, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Chicken Sausage Roll", price: 90, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Parotta Shawarma", price: 70, type: "non-veg", isCombo: false, isSpicy: false },
  ],
  "Ice Cream Shake": [
    { name: "Vanilla Shake", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Strawberry Shake", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Pista Shake", price: 90, type: "veg", isCombo: false, isSpicy: false },
    { name: "Chocolate Shake", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Spanish Shake", price: 90, type: "veg", isCombo: false, isSpicy: false },
    { name: "Mango Ice Cream Shake", price: 90, type: "veg", isCombo: false, isSpicy: false },
    { name: "Black Current Ice Cream Shake", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Red Velvet Ice Cream Shake", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Gulfi Ice Cream Shake", price: 100, type: "veg", isCombo: false, isSpicy: false },
    { name: "Fig Shake", price: 100, type: "veg", isCombo: false, isSpicy: false },
  ],
  "Avil Milk": [
    { name: "Avil Milk Normal", price: 60, type: "veg", isCombo: false, isSpicy: false },
    { name: "Avil Milk SP", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Mango Avil Milk", price: 60, type: "veg", isCombo: false, isSpicy: false },
    { name: "Snickers Avil Milk", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "KitKat Avil Milk", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Oreo Avil Milk", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Dairy Milk Avil Milk", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Fruit Avil Milk", price: 70, type: "veg", isCombo: false, isSpicy: false },
    { name: "Dry Fruit Avil Milk", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Tender Avil Milk", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Cafe Zone Avil Milk", price: 80, type: "veg", isCombo: false, isSpicy: false },
  ],
  "Burger": [
    { name: "Patty Burger", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Veg Burger", price: 80, type: "veg", isCombo: false, isSpicy: false },
    { name: "Zinger Burger", price: 90, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Sausage Burger", price: 80, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Chicken Patty", price: 90, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "American Sausage", price: 100, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Sausage Cheese Burger", price: 100, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Chicken Patty Cheese", price: 130, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Tandoori Burger", price: 120, type: "non-veg", isCombo: false, isSpicy: true },
    { name: "Zinger Cheese", price: 150, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Ham Burger", price: 200, type: "non-veg", isCombo: false, isSpicy: false },
    { name: "Mini Patty Burger", price: 60, type: "veg", isCombo: false, isSpicy: false },
  ],
};

/* ── Seed ── */
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Reset counters
  await Counter.deleteMany({ _id: { $in: ["restaurant", "category", "menu_item", "offer"] } });

  // Clear existing data for restaurant 1
  await Promise.all([
    Restaurant.deleteMany({}),
    Category.deleteMany({}),
    MenuItem.deleteMany({}),
    Offer.deleteMany({}),
  ]);
  console.log("🗑  Cleared existing data");

  // Create restaurant
  const restId = await nextId("restaurant");
  await Restaurant.create({ id: restId, ...RESTAURANT });
  console.log(`🏪 Created Restaurant: ${RESTAURANT.name} (id=${restId})`);

  // Create categories + items
  let catOrder = 1;
  let itemOrder = 1;

  for (const [catName, items] of Object.entries(ITEMS_BY_CATEGORY)) {
    const catId = await nextId("category");
    await Category.create({
      id: catId,
      restaurantId: restId,
      name: catName,
      imageUrl: CAT_IMAGES[catName] ?? null,
      sortOrder: catOrder++,
    });
    console.log(`  📁 Category: ${catName} (id=${catId})`);

    for (const item of items) {
      const itemId = await nextId("menu_item");
      await MenuItem.create({
        id: itemId,
        restaurantId: restId,
        categoryId: catId,
        name: item.name,
        price: item.price,
        description: item.description || null,
        type: item.type,
        isCombo: item.isCombo,
        isSpicy: item.isSpicy,
        isAvailable: true,
        sortOrder: itemOrder++,
      });
      process.stdout.write(`    ✓ ${item.name} ₹${item.price}\n`);
    }
  }

  // Offers
  const offerId = await nextId("offer");
  await Offer.create({
    id: offerId,
    restaurantId: restId,
    title: "Free Home Delivery",
    description: "Up to 6 km distance. Minimum order ₹450.",
    discountPercent: null,
    validUntil: null,
    isActive: true,
  });
  console.log("🎁 Offer added");

  const total = await MenuItem.countDocuments({ restaurantId: restId });
  console.log(`\n✅ Done! ${total} items seeded across ${Object.keys(ITEMS_BY_CATEGORY).length} categories.`);
  await mongoose.disconnect();
}

seed().catch(e => { console.error("Seed failed:", e.message); process.exit(1); });
