-- CreateEnum
CREATE TYPE "public"."TestStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."Test" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "status" "public"."TestStatus" NOT NULL DEFAULT 'PENDING',
    "result" TEXT,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);
