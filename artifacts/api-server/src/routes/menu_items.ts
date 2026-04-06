import { Router, type IRouter } from "express";
import { MenuItem, Category, getNextId } from "../lib/models";

const router: IRouter = Router();

router.get("/restaurants/:restaurantId/items", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }

  const filter: Record<string, unknown> = { restaurantId };
  if (req.query.categoryId) filter.categoryId = parseInt(req.query.categoryId as string, 10);
  if (req.query.type) filter.type = req.query.type as string;

  const items = await MenuItem.find(filter).sort({ sortOrder: 1 }).lean();

  // Attach category name
  const categoryIds = [...new Set(items.map(i => i.categoryId).filter(Boolean))];
  const categories = await Category.find({ id: { $in: categoryIds } }).lean();
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  const result = items.map(item => ({ ...item, categoryName: item.categoryId ? (catMap.get(item.categoryId) ?? null) : null }));
  res.json(result);
});

router.post("/restaurants/:restaurantId/items", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }
  const { categoryId, name, description, price, imageUrl, type, isCombo, comboItemCount, isSpicy, isAvailable, sortOrder } = req.body;
  if (!name || price == null) { res.status(400).json({ error: "name and price are required" }); return; }

  const id = await getNextId("menuItem");
  const item = await MenuItem.create({
    id,
    restaurantId,
    categoryId: categoryId ?? null,
    name,
    description: description ?? null,
    price: Number(price),
    imageUrl: imageUrl ?? null,
    type: type ?? "veg",
    isCombo: isCombo ?? false,
    comboItemCount: comboItemCount ?? null,
    isSpicy: isSpicy ?? false,
    isAvailable: isAvailable ?? true,
    sortOrder: sortOrder ?? 0,
  });
  res.status(201).json({ ...item.toObject(), categoryName: null });
});

router.put("/items/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { categoryId, name, description, price, imageUrl, type, isCombo, comboItemCount, isSpicy, isAvailable, sortOrder } = req.body;
  if (!name || price == null) { res.status(400).json({ error: "name and price are required" }); return; }

  const item = await MenuItem.findOneAndUpdate(
    { id },
    {
      categoryId: categoryId ?? null, name,
      description: description ?? null, price: Number(price),
      imageUrl: imageUrl ?? null, type: type ?? "veg",
      isCombo: isCombo ?? false, comboItemCount: comboItemCount ?? null,
      isSpicy: isSpicy ?? false, isAvailable: isAvailable ?? true,
      sortOrder: sortOrder ?? 0,
    },
    { new: true, lean: true }
  );
  if (!item) { res.status(404).json({ error: "Item not found" }); return; }
  res.json({ ...item, categoryName: null });
});

router.delete("/items/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await MenuItem.findOneAndDelete({ id });
  res.sendStatus(204);
});

export default router;
