import { WebhookTopics } from "@prisma/client";

export namespace WebhookTypes {
  interface GenericWebhookPayload {
    topic: WebhookTopics;
    timestamp: number;
  }

  export interface JobStartedWebhookPayload extends GenericWebhookPayload {
    topic: "JOB_STARTED";
    data: {
      jobId: string;
      requestJobFile: {
        id: string;
        url: string;
      };
    };
  }

  export interface JobCompletedWebhookPayload extends GenericWebhookPayload {
    topic: "JOB_COMPLETED";
    data: {
      jobId: string;
      status: "SUCCESS" | "FAILED";
      errors: string[];
      responseJobFile: {
        id: string;
        url: string;
      } | null;
    };
  }

  export type WebhookPayload =
    | JobStartedWebhookPayload
    | JobCompletedWebhookPayload;
}
