-- CreateTable
CREATE TABLE "_UserFavoriteProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserFavoriteProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserFavoriteProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserFavoriteProducts_AB_unique" ON "_UserFavoriteProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFavoriteProducts_B_index" ON "_UserFavoriteProducts"("B");
