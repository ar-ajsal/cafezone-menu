import { Router, type IRouter } from "express";
import { Restaurant, Category, MenuItem, Offer, getNextId } from "../lib/models";

const router: IRouter = Router();

/* ─── GET all restaurants ─────────────────────────────────── */
router.get("/restaurants", async (_req, res): Promise<void> => {
  const restaurants = await Restaurant.find().sort({ createdAt: 1 }).lean();
  res.json(restaurants);
});

/* ─── POST create restaurant ──────────────────────────────── */
router.post("/restaurants", async (req, res): Promise<void> => {
  const { name, description, logoUrl, phone, address, primaryColor, slug } = req.body;
  if (!name || !slug) {
    res.status(400).json({ error: "name and slug are required" });
    return;
  }
  const existing = await Restaurant.findOne({ slug }).lean();
  if (existing) { res.status(409).json({ error: "slug already exists" }); return; }

  const id = await getNextId("restaurant");
  const restaurant = await Restaurant.create({ id, name, description, logoUrl, phone, address, primaryColor, slug });
  res.status(201).json(restaurant.toObject());
});

/* ─── GET single restaurant ───────────────────────────────── */
router.get("/restaurants/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const restaurant = await Restaurant.findOne({ id }).lean();
  if (!restaurant) { res.status(404).json({ error: "Restaurant not found" }); return; }
  res.json(restaurant);
});

/* ─── PUT update restaurant ───────────────────────────────── */
router.put("/restaurants/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, description, logoUrl, phone, address, primaryColor, slug } = req.body;
  if (!name || !slug) { res.status(400).json({ error: "name and slug are required" }); return; }
  const restaurant = await Restaurant.findOneAndUpdate(
    { id },
    { name, description: description ?? null, logoUrl: logoUrl ?? null, phone: phone ?? null, address: address ?? null, primaryColor: primaryColor ?? null, slug },
    { new: true, lean: true }
  );
  if (!restaurant) { res.status(404).json({ error: "Restaurant not found" }); return; }
  res.json(restaurant);
});

/* ─── DELETE restaurant ───────────────────────────────────── */
router.delete("/restaurants/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await Restaurant.findOneAndDelete({ id });
  res.sendStatus(204);
});

/* ─── GET full menu ───────────────────────────────────────── */
router.get("/restaurants/:restaurantId/menu", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }

  const restaurant = await Restaurant.findOne({ id: restaurantId }).lean();
  if (!restaurant) { res.status(404).json({ error: "Restaurant not found" }); return; }

  const categories = await Category.find({ restaurantId }).sort({ sortOrder: 1 }).lean();
  const items = await MenuItem.find({ restaurantId }).sort({ sortOrder: 1 }).lean();
  const offers = await Offer.find({ restaurantId, isActive: true }).lean();

  res.json({ restaurant, categories, items, offers });
});

/* ─── GET restaurant stats ────────────────────────────────── */
router.get("/restaurants/:restaurantId/stats", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }

  const [totalCategories, totalItems, totalOffers, vegCount, nonVegCount, beverageCount, comboCount] = await Promise.all([
    Category.countDocuments({ restaurantId }),
    MenuItem.countDocuments({ restaurantId }),
    Offer.countDocuments({ restaurantId }),
    MenuItem.countDocuments({ restaurantId, type: "veg" }),
    MenuItem.countDocuments({ restaurantId, type: "non-veg" }),
    MenuItem.countDocuments({ restaurantId, type: "beverage" }),
    MenuItem.countDocuments({ restaurantId, isCombo: true }),
  ]);

  res.json({ totalCategories, totalItems, totalOffers, vegCount, nonVegCount, beverageCount, comboCount });
});

/* ─── GET QR data ─────────────────────────────────────────── */
router.get("/restaurants/:restaurantId/qr", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }
  const restaurant = await Restaurant.findOne({ id: restaurantId }).lean();
  if (!restaurant) { res.status(404).json({ error: "Restaurant not found" }); return; }

  const domain = process.env.APP_DOMAIN ?? `localhost:${process.env.PORT ?? 5000}`;
  const protocol = domain.includes("localhost") ? "http" : "https";
  const url = `${protocol}://${domain}/menu/${restaurantId}`;
  res.json({ url, restaurantId, restaurantName: restaurant.name });
});

export default router;
