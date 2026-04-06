import { Router, type IRouter } from "express";
import { Category, getNextId } from "../lib/models";

const router: IRouter = Router();

router.get("/restaurants/:restaurantId/categories", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }
  const categories = await Category.find({ restaurantId }).sort({ sortOrder: 1 }).lean();
  res.json(categories);
});

router.post("/restaurants/:restaurantId/categories", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }
  const { name, description, imageUrl, sortOrder } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }
  const id = await getNextId("category");
  const category = await Category.create({ id, restaurantId, name, description: description ?? null, imageUrl: imageUrl ?? null, sortOrder: sortOrder ?? 0 });
  res.status(201).json(category.toObject());
});

router.put("/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, description, imageUrl, sortOrder } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }
  const category = await Category.findOneAndUpdate(
    { id },
    { name, description: description ?? null, imageUrl: imageUrl ?? null, sortOrder: sortOrder ?? 0 },
    { new: true, lean: true }
  );
  if (!category) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(category);
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await Category.findOneAndDelete({ id });
  res.sendStatus(204);
});

export default router;
