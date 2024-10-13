"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const job_router_1 = __importDefault(require("./job.router"));
const product_router_1 = __importDefault(require("./product.router"));
const webhook_router_1 = __importDefault(require("./webhook.router"));
const router = express_1.default.Router();
router.use("/job", job_router_1.default);
router.use("/product", product_router_1.default);
router.use("/webhook", webhook_router_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map