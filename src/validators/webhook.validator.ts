import z from "zod";

export const webhookEventsSchema = z.enum(["JOB_STARTED", "JOB_COMPLETED"]);

export const webhookSchema = z.object({
  url: z.string().url().min(3),
  name: z.string().min(3, "Name Should be at least 3 characters"),
  topics: z.array(webhookEventsSchema),
});

export type WebhookDTO = z.infer<typeof webhookSchema>;

export const validateWebhookData = (webhookData: any) => {
  try {
    webhookSchema.parse(webhookData);
    return webhookData as WebhookDTO;
  } catch (e) {
    console.log("Got error while validating webhook data", e);
    throw new Error(e.errors[0]);
  }
};
