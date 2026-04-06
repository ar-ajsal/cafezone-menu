import { Router, type IRouter } from "express";
import multer from "multer";
import { uploadImageBuffer } from "../lib/cloudinary";

const router: IRouter = Router();

// Store file in memory so we can stream it to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/upload", upload.single("image"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No image file provided. Send as multipart/form-data with field name 'image'" });
    return;
  }
  const folder = (req.body.folder as string | undefined) ?? "digital-menu";
  const url = await uploadImageBuffer(req.file.buffer, folder);
  res.json({ url });
});

export default router;
