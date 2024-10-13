"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWebhookData = exports.webhookSchema = exports.webhookEventsSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.webhookEventsSchema = zod_1.default.enum(["JOB_STARTED", "JOB_COMPLETED"]);
exports.webhookSchema = zod_1.default.object({
    url: zod_1.default.string().url().min(3),
    name: zod_1.default.string().min(3, "Name Should be at least 3 characters"),
    topics: zod_1.default.array(exports.webhookEventsSchema),
});
const validateWebhookData = (webhookData) => {
    try {
        exports.webhookSchema.parse(webhookData);
        return webhookData;
    }
    catch (e) {
        console.log("Got error while validating webhook data", e);
        throw new Error(e.errors[0]);
    }
};
exports.validateWebhookData = validateWebhookData;
//# sourceMappingURL=webhook.validator.js.map