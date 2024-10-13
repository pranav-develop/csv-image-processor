-- CreateEnum
CREATE TYPE "WebhookTopics" AS ENUM ('JOB_STARTED', 'JOB_COMPLETED');

-- CreateTable
CREATE TABLE "WebhookTopic" (
    "id" TEXT NOT NULL,
    "topic" "WebhookTopics" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WebhookToWebhookTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookTopic_topic_key" ON "WebhookTopic"("topic");

-- CreateIndex
CREATE INDEX "WebhookTopic_topic_idx" ON "WebhookTopic"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "_WebhookToWebhookTopic_AB_unique" ON "_WebhookToWebhookTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_WebhookToWebhookTopic_B_index" ON "_WebhookToWebhookTopic"("B");

-- AddForeignKey
ALTER TABLE "_WebhookToWebhookTopic" ADD CONSTRAINT "_WebhookToWebhookTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WebhookToWebhookTopic" ADD CONSTRAINT "_WebhookToWebhookTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "WebhookTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
