import { Router } from "express";
import * as ctrl from "../controllers/productsController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", asyncHandler(ctrl.create));
router.get("/", asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getOne));
router.patch("/:id", asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

router.post("/:id/stock/increase", asyncHandler(ctrl.increase));
router.post("/:id/stock/decrease", asyncHandler(ctrl.decrease));

export default router;
