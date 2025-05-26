-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Check" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "Check_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Check_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Check" ("buyerId", "createdAt", "id", "price", "productId") SELECT "buyerId", "createdAt", "id", "price", "productId" FROM "Check";
DROP TABLE "Check";
ALTER TABLE "new_Check" RENAME TO "Check";
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "placeId" TEXT,
    "productId" TEXT,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("createdAt", "id", "placeId", "productId", "text", "updatedAt", "userId") SELECT "createdAt", "id", "placeId", "productId", "text", "updatedAt", "userId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "crmId" TEXT,
    "creatorId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "short" TEXT,
    "description" TEXT,
    "image" TEXT,
    "imageDhash" TEXT,
    "city" TEXT,
    "address" TEXT,
    "coordinates" TEXT,
    "date" DATETIME,
    CONSTRAINT "Place_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Place" ("active", "address", "city", "coordinates", "createdAt", "creatorId", "crmId", "date", "description", "id", "image", "imageDhash", "name", "short", "updatedAt") SELECT "active", "address", "city", "coordinates", "createdAt", "creatorId", "crmId", "date", "description", "id", "image", "imageDhash", "name", "short", "updatedAt" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
CREATE INDEX "Place_imageDhash_idx" ON "Place"("imageDhash");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "price" REAL NOT NULL DEFAULT 0,
    "crmId" TEXT,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short" TEXT,
    "description" TEXT,
    "image" TEXT,
    "imageDhash" TEXT,
    "city" TEXT,
    "address" TEXT,
    "coordinates" TEXT,
    "beginDate" DATETIME,
    "endDate" DATETIME,
    "assistant" TEXT,
    CONSTRAINT "Product_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("active", "address", "assistant", "beginDate", "city", "coordinates", "createdAt", "creatorId", "crmId", "description", "endDate", "id", "image", "imageDhash", "name", "price", "short", "type", "updatedAt") SELECT "active", "address", "assistant", "beginDate", "city", "coordinates", "createdAt", "creatorId", "crmId", "description", "endDate", "id", "image", "imageDhash", "name", "price", "short", "type", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_imageDhash_idx" ON "Product"("imageDhash");
CREATE TABLE "new_Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "placeId" TEXT,
    "productId" TEXT,
    CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rating_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rating_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Rating" ("createdAt", "id", "placeId", "productId", "userId", "value") SELECT "createdAt", "id", "placeId", "productId", "userId", "value" FROM "Rating";
DROP TABLE "Rating";
ALTER TABLE "new_Rating" RENAME TO "Rating";
CREATE TABLE "new_RoutePoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "productId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "RoutePoint_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoutePoint_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoutePoint" ("createdAt", "date", "id", "order", "placeId", "productId", "updatedAt") SELECT "createdAt", "date", "id", "order", "placeId", "productId", "updatedAt" FROM "RoutePoint";
DROP TABLE "RoutePoint";
ALTER TABLE "new_RoutePoint" RENAME TO "RoutePoint";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
