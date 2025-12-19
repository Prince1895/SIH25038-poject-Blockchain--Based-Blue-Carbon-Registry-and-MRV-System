/*
  Warnings:

  - You are about to drop the column `name` on the `Industry` table. All the data in the column will be lost.
  - The `status` column on the `Industry` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `mobile` on the `OTP` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `PublicUser` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Verifier` table. All the data in the column will be lost.
  - The `status` column on the `Verifier` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `description` to the `Industry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designation` to the `Industry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Industry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Industry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization` to the `Industry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Industry` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `OTP` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `description` to the `PublicUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designation` to the `PublicUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `PublicUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `PublicUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization` to the `PublicUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `PublicUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Verifier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designation` to the `Verifier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Verifier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Verifier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization` to the `Verifier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Verifier` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."Industry" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "designation" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "organization" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "projectId" INTEGER,
ADD COLUMN     "walletAddress" TEXT,
ALTER COLUMN "tier" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."AccountStatus" NOT NULL DEFAULT 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "public"."OTP" DROP COLUMN "mobile",
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."PublicUser" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "designation" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "organization" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "public"."VerificationTask" ADD COLUMN     "tokenId" INTEGER,
ADD COLUMN     "transactionHash" TEXT;

-- AlterTable
ALTER TABLE "public"."Verifier" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "designation" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "organization" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."AccountStatus" NOT NULL DEFAULT 'PENDING_APPROVAL';
