import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("MONGODB_URI not set"); process.exit(1); }

const menuItemSchema = new mongoose.Schema({ id: Number, categoryId: Number, name: String, imageUrl: String }, { timestamps: true, strict: false });
const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);

// Delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function seedImages() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // We find all items to update them with exact AI-generated image URLs based on their specific names
  const items = await MenuItem.find();
  console.log(`Found ${items.length} items. Mapping exact images...`);

  let updated = 0;
  for (const item of items) {
    if (!item.name) continue;
    
    // Generate an exact, high-quality image URL representation for this specific item
    const prompt = `${item.name}, delicious food drink photography, high quality, restaurant menu`;
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=400&nologo=true`;
    
    item.imageUrl = imageUrl;
    await item.save();
    updated++;
    
    // Tiny delay to avoid overwhelming the database
    await delay(50);
  }

  console.log(`✅ Assigned exact images to ${updated} menu items!`);
  await mongoose.disconnect();
}

seedImages().catch(e => { console.error("Script failed:", e.message); process.exit(1); });
