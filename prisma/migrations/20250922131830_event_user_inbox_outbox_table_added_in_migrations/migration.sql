/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER');

-- DropTable
DROP TABLE "public"."Test";

-- DropEnum
DROP TYPE "public"."TestStatus";

-- CreateTable
CREATE TABLE "public"."outbox" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "content" JSONB NOT NULL,
    "occurredOnUtc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedOnUtc" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InboxMessage" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "receivedOnUtc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedOnUtc" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" BIGINT NOT NULL,
    "eventType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" BIGINT,
    "payload" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "contact" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'OPERATOR',
    "createdBy" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_processed_createdAt_idx" ON "public"."outbox"("processed", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InboxMessage_eventId_key" ON "public"."InboxMessage"("eventId");

-- CreateIndex
CREATE INDEX "events_entityType_entityId_idx" ON "public"."events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "events_eventType_idx" ON "public"."events"("eventType");

-- CreateIndex
CREATE INDEX "events_occurredAt_idx" ON "public"."events"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
