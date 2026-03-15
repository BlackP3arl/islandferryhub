/*
  Warnings:

  - Added the required column `socialLinks` to the `Operator` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Operator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "boatName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "contactNumber" TEXT NOT NULL,
    "liveLocationUrl" TEXT,
    "ticketingUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredExpiry" DATETIME,
    "hasFixedSchedule" BOOLEAN NOT NULL DEFAULT true,
    "socialLinks" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Operator" ("boatName", "contactNumber", "createdAt", "featuredExpiry", "id", "isActive", "isFeatured", "liveLocationUrl", "logoUrl", "name", "ticketingUrl", "updatedAt") SELECT "boatName", "contactNumber", "createdAt", "featuredExpiry", "id", "isActive", "isFeatured", "liveLocationUrl", "logoUrl", "name", "ticketingUrl", "updatedAt" FROM "Operator";
DROP TABLE "Operator";
ALTER TABLE "new_Operator" RENAME TO "Operator";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
