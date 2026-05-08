/*
  Warnings:

  - You are about to drop the `PhoneSignup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PhoneSignup";

-- CreateTable
CREATE TABLE "EmailSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailSignup_email_key" ON "EmailSignup"("email");
