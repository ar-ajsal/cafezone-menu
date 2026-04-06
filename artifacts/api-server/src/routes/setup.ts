import { Router, type IRouter } from "express";
import { Restaurant, Category, MenuItem, Offer, getNextId } from "../lib/models";

const router: IRouter = Router();

/**
 * POST /api/setup
 * Idempotent — creates restaurant id=1 with default data if it doesn't exist.
 * Run this ONCE after first deploy.
 */
router.post("/setup", async (req, res): Promise<void> => {
  const existing = await Restaurant.findOne({ id: 1 }).lean();
  if (existing) {
    res.json({ message: "Already set up", restaurant: existing });
    return;
  }

  // Make sure counter starts at right value
  const id = await getNextId("restaurant");
  const effectiveId = id < 1 ? 1 : id;

  const { name, slug, description, phone, address, logoUrl } = req.body;

  const restaurant = await Restaurant.create({
    id: effectiveId,
    name: name ?? "My Restaurant",
    slug: slug ?? "my-restaurant",
    description: description ?? null,
    logoUrl: logoUrl ?? null,
    phone: phone ?? null,
    address: address ?? null,
    primaryColor: "#22c55e",
  });

  res.status(201).json({
    message: "Setup complete! Restaurant created with id=1.",
    restaurant: restaurant.toObject(),
  });
});

/**
 * GET /api/setup/status
 * Returns whether initial setup has been done.
 */
router.get("/setup/status", async (_req, res): Promise<void> => {
  const restaurant = await Restaurant.findOne({ id: 1 }).lean();
  res.json({
    isSetup: !!restaurant,
    restaurant: restaurant ?? null,
  });
});

export default router;
