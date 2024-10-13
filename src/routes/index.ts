import express from "express";
import jobRouter from "./job.router";
import productRouter from "./product.router";
import webhookRouter from "./webhook.router";

const router = express.Router();

router.use("/job", jobRouter);
router.use("/product", productRouter);
router.use("/webhook", webhookRouter);

export default router;
