-- AlterTable
ALTER TABLE "Media" ADD COLUMN "dhash" TEXT;

-- CreateIndex
CREATE INDEX "Media_dhash_idx" ON "Media"("dhash");
