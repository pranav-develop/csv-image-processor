"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webhook_controller_1 = __importDefault(require("../controller/webhook.controller"));
const express_1 = __importDefault(require("express"));
const webhookRouter = express_1.default.Router();
webhookRouter.post("/register", webhook_controller_1.default.registerWebhookHandler);
webhookRouter.get("/list", webhook_controller_1.default.listWebhooksHandler);
webhookRouter.post("/delete/:id", webhook_controller_1.default.deleteWebhookHandler);
exports.default = webhookRouter;
//# sourceMappingURL=webhook.router.js.map