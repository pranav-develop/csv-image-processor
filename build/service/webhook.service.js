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
const DBClient_1 = __importDefault(require("../config/DBClient"));
const crypto_1 = __importDefault(require("crypto"));
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
class WebhookService {
    static registerWebhook(_a) {
        return __awaiter(this, arguments, void 0, function* ({ webhookData, }) {
            const topics = yield DBClient_1.default.getInstance().webhookTopic.findMany({
                where: {
                    topic: {
                        in: webhookData.topics,
                    },
                },
            });
            const secret = crypto_1.default.randomBytes(64).toString("hex");
            const webhook = yield DBClient_1.default.getInstance().webhook.create({
                data: {
                    url: webhookData.url,
                    topics: {
                        connect: topics.map((topic) => ({ id: topic.id })),
                    },
                    name: webhookData.name,
                    secret,
                },
            });
            return webhook;
        });
    }
    static listWebhooks() {
        return __awaiter(this, void 0, void 0, function* () {
            return DBClient_1.default.getInstance().webhook.findMany({
                select: {
                    id: true,
                    url: true,
                    topics: {
                        select: {
                            topic: true,
                        },
                    },
                    isActive: true,
                    createdAt: true,
                },
            });
        });
    }
    static deleteWebhook(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id }) {
            const webhook = yield DBClient_1.default.getInstance().webhook.findUnique({
                where: {
                    id,
                },
            });
            if (!webhook) {
                throw new NotFoundError_1.default(`No webhook found with id ${id}`);
            }
            return DBClient_1.default.getInstance().webhook.delete({
                where: {
                    id,
                },
            });
        });
    }
    static sendWebhookEvent(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhookTopic = yield DBClient_1.default.getInstance().webhookTopic.findUnique({
                where: {
                    topic: payload.topic,
                },
                include: {
                    webhooks: true,
                },
            });
            if (!webhookTopic)
                return;
            if (webhookTopic.webhooks.length <= 0)
                return;
            // Fire and Forget
            yield Promise.all(webhookTopic.webhooks.map((webhook) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield fetch(webhook.url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Signature": crypto_1.default
                                .createHmac("sha256", webhook.secret)
                                .update(JSON.stringify(payload))
                                .digest("hex"),
                        },
                        body: JSON.stringify(payload),
                    });
                }
                catch (e) { }
            })));
        });
    }
}
exports.default = WebhookService;
//# sourceMappingURL=webhook.service.js.map