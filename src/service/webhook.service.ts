import { Prisma, WebhookTopics } from "@prisma/client";
import DBClient from "config/DBClient";
import crypto from "crypto";
import NotFoundError from "errors/NotFoundError";
import { WebhookTypes } from "types/WebhookTypes";
import { WebhookDTO } from "validators/webhook.validator";

export default class WebhookService {
  public static async registerWebhook({
    webhookData,
  }: {
    webhookData: WebhookDTO;
  }) {
    const topics = await DBClient.getInstance().webhookTopic.findMany({
      where: {
        topic: {
          in: webhookData.topics,
        },
      },
    });
    const secret = crypto.randomBytes(64).toString("hex");
    const webhook = await DBClient.getInstance().webhook.create({
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
  }

  public static async listWebhooks() {
    return DBClient.getInstance().webhook.findMany({
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
  }

  public static async deleteWebhook({ id }: { id: string }) {
    const webhook = await DBClient.getInstance().webhook.findUnique({
      where: {
        id,
      },
    });
    if (!webhook) {
      throw new NotFoundError(`No webhook found with id ${id}`);
    }
    return DBClient.getInstance().webhook.delete({
      where: {
        id,
      },
    });
  }

  public static async sendWebhookEvent(payload: WebhookTypes.WebhookPayload) {
    const webhookTopic = await DBClient.getInstance().webhookTopic.findUnique({
      where: {
        topic: payload.topic,
      },
      include: {
        webhooks: true,
      },
    });

    if (!webhookTopic) return;

    if (webhookTopic.webhooks.length <= 0) return;

    // Fire and Forget
    await Promise.all(
      webhookTopic.webhooks.map(async (webhook) => {
        try {
          await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Signature": crypto
                .createHmac("sha256", webhook.secret)
                .update(JSON.stringify(payload))
                .digest("hex"),
            },
            body: JSON.stringify(payload),
          });
        } catch (e) {}
      })
    );
  }
}
