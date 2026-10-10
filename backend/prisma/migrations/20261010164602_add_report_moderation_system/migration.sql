-- CreateEnum
CREATE TYPE "ReportAction" AS ENUM ('DISMISSED', 'WARNING_ISSUED', 'LISTING_REMOVED', 'USER_SUSPENDED', 'USER_BANNED');

-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'REMOVED_BY_ADMIN';

-- AlterTable: Report - add resolution audit trail fields
ALTER TABLE "Report" ADD COLUMN "actionTaken" "ReportAction",
ADD COLUMN "resolutionNotes" TEXT,
ADD COLUMN "resolvedAt" TIMESTAMP(3),
ADD COLUMN "reviewedById" TEXT;

-- AlterTable: Report - update onDelete for listing and reportedUser
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_listingId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_reportedUserId_fkey";

ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: reviewedBy -> User
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt" DESC);
CREATE INDEX "Report_reporterId_listingId_idx" ON "Report"("reporterId", "listingId");
CREATE INDEX "Report_reportedUserId_idx" ON "Report"("reportedUserId");

-- Remove SECURITY_STAFF from Role enum (safe: no rows use this value)
-- PostgreSQL doesn't support DROP VALUE from enum directly, so we recreate it
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
DROP TYPE "Role_old";
