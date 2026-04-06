import { Router, type IRouter } from "express";
import healthRouter from "./health";
import restaurantsRouter from "./restaurants";
import categoriesRouter from "./categories";
import menuItemsRouter from "./menu_items";
import offersRouter from "./offers";
import uploadRouter from "./upload";
import setupRouter from "./setup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(restaurantsRouter);
router.use(categoriesRouter);
router.use(menuItemsRouter);
router.use(offersRouter);
router.use(uploadRouter);
router.use(setupRouter);

export default router;
