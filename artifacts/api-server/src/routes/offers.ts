import { Router, type IRouter } from "express";
import { Offer, getNextId } from "../lib/models";

const router: IRouter = Router();

router.get("/restaurants/:restaurantId/offers", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }
  const offers = await Offer.find({ restaurantId }).sort({ id: 1 }).lean();
  res.json(offers);
});

router.post("/restaurants/:restaurantId/offers", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId, 10);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }
  const { title, description, imageUrl, discountPercent, validUntil, isActive } = req.body;
  if (!title) { res.status(400).json({ error: "title is required" }); return; }
  const id = await getNextId("offer");
  const offer = await Offer.create({
    id, restaurantId, title,
    description: description ?? null,
    imageUrl: imageUrl ?? null,
    discountPercent: discountPercent != null ? Number(discountPercent) : null,
    validUntil: validUntil ?? null,
    isActive: isActive ?? true,
  });
  res.status(201).json(offer.toObject());
});

router.put("/offers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { title, description, imageUrl, discountPercent, validUntil, isActive } = req.body;
  if (!title) { res.status(400).json({ error: "title is required" }); return; }
  const offer = await Offer.findOneAndUpdate(
    { id },
    {
      title,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      discountPercent: discountPercent != null ? Number(discountPercent) : null,
      validUntil: validUntil ?? null,
      isActive: isActive ?? true,
    },
    { new: true, lean: true }
  );
  if (!offer) { res.status(404).json({ error: "Offer not found" }); return; }
  res.json(offer);
});

router.delete("/offers/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await Offer.findOneAndDelete({ id });
  res.sendStatus(204);
});

export default router;
