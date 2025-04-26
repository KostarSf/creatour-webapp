-- AlterTable
ALTER TABLE "Place" ADD COLUMN "imageDhash" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "imageDhash" TEXT;

-- CreateIndex
CREATE INDEX "Place_imageDhash_idx" ON "Place"("imageDhash");

-- CreateIndex
CREATE INDEX "Product_imageDhash_idx" ON "Product"("imageDhash");
