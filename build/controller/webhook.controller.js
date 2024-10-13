"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webhook_service_1 = __importDefault(require("../service/webhook.service"));
const errorhandler_1 = require("../utils/errorhandler");
const GeneralResponse_1 = require("../utils/GeneralResponse");
const webhook_validator_1 = require("../validators/webhook.validator");
class WebhookController {
    static registerWebhookHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Add your code here
                const webhookCreationData = req.body;
                const webhookDTO = (0, webhook_validator_1.validateWebhookData)(webhookCreationData);
                const webhook = yield webhook_service_1.default.registerWebhook({
                    webhookData: webhookDTO,
                });
                return (0, GeneralResponse_1.sendApiResponse)(res, new GeneralResponse_1.GeneralResponse({
                    hasError: true,
                    data: {
                        name: webhook.name,
                        id: webhook.id,
                        isActive: webhook.isActive,
                        secret: webhook.secret,
                        createdAt: webhook.createdAt,
                        updatedAt: webhook.updatedAt,
                    },
                    msg: "Webhook registered successfully",
                    status: 200,
                }));
            }
            catch (e) {
                return (0, errorhandler_1.sendErrorResponse)(res, e, {
                    message: "Error while registering webhook",
                    status: 500,
                });
            }
        });
    }
    static listWebhooksHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const webhooks = yield webhook_service_1.default.listWebhooks();
                return (0, GeneralResponse_1.sendApiResponse)(res, new GeneralResponse_1.GeneralResponse({
                    hasError: false,
                    data: webhooks,
                    msg: "List of webhooks",
                    status: 200,
                }));
            }
            catch (e) {
                return (0, errorhandler_1.sendErrorResponse)(res, e, {
                    message: "Error while fetching webhooks",
                    status: 500,
                });
            }
        });
    }
    static deleteWebhookHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const webhookId = req.params.id;
                yield webhook_service_1.default.deleteWebhook({ id: webhookId });
                return (0, GeneralResponse_1.sendApiResponse)(res, new GeneralResponse_1.GeneralResponse({
                    hasError: false,
                    data: {
                        id: webhookId,
                    },
                    msg: "Webhook deleted successfully",
                    status: 200,
                }));
            }
            catch (e) {
                return (0, errorhandler_1.sendErrorResponse)(res, e, {
                    message: "Error while deleting webhook",
                    status: 500,
                });
            }
        });
    }
}
exports.default = WebhookController;
//# sourceMappingURL=webhook.controller.js.map