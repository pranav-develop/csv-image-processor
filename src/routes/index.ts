import express from "express";
import jobRouter from "./job.router";
import productRouter from "./product.router";

const router = express.Router();

router.use("/job", jobRouter);
router.use("/product", productRouter);

export default router;
