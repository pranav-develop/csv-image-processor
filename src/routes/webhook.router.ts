import WebhookController from "controller/webhook.controller";
import express from "express";

const webhookRouter = express.Router();

webhookRouter.post("/register", WebhookController.registerWebhookHandler);

webhookRouter.get("/list", WebhookController.listWebhooksHandler);

webhookRouter.post("/delete/:id", WebhookController.deleteWebhookHandler);

export default webhookRouter;
