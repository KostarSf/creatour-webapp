-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "city" TEXT,
    "address" TEXT,
    "coordinates" TEXT,
    CONSTRAINT "Place_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Place" ("address", "city", "coordinates", "createdAt", "creatorId", "crmId", "description", "id", "image", "name", "short", "updatedAt") SELECT "address", "city", "coordinates", "createdAt", "creatorId", "crmId", "description", "id", "image", "name", "short", "updatedAt" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
