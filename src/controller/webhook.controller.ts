import { Request, Response } from "express";
import WebhookService from "service/webhook.service";
import { sendErrorResponse } from "utils/errorhandler";
import { GeneralResponse, sendApiResponse } from "utils/GeneralResponse";
import { validateWebhookData } from "validators/webhook.validator";

export default class WebhookController {
  public static async registerWebhookHandler(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      // Add your code here
      const webhookCreationData = req.body;
      const webhookDTO = validateWebhookData(webhookCreationData);

      const webhook = await WebhookService.registerWebhook({
        webhookData: webhookDTO,
      });
      return sendApiResponse(
        res,
        new GeneralResponse({
          hasError: true,
          data: webhook,
          msg: "Webhook registered successfully",
          status: 200,
        })
      );
    } catch (e) {
      return sendErrorResponse(res, e, {
        message: "Error while registering webhook",
        status: 500,
      });
    }
  }

  public static async listWebhooksHandler(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const webhooks = await WebhookService.listWebhooks();
      return sendApiResponse(
        res,
        new GeneralResponse({
          hasError: false,
          data: webhooks,
          msg: "List of webhooks",
          status: 200,
        })
      );
    } catch (e) {
      return sendErrorResponse(res, e, {
        message: "Error while fetching webhooks",
        status: 500,
      });
    }
  }

  public static async deleteWebhookHandler(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const webhookId = req.params.id;
      await WebhookService.deleteWebhook({ id: webhookId });
      return sendApiResponse(
        res,
        new GeneralResponse({
          hasError: false,
          data: null,
          msg: "Webhook deleted successfully",
          status: 200,
        })
      );
    } catch (e) {
      return sendErrorResponse(res, e, {
        message: "Error while deleting webhook",
        status: 500,
      });
    }
  }
}
