-- CreateTable
CREATE TABLE "FeatureRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Operator" ("boatName", "contactNumber", "createdAt", "id", "isActive", "liveLocationUrl", "logoUrl", "name", "ticketingUrl", "updatedAt") SELECT "boatName", "contactNumber", "createdAt", "id", "isActive", "liveLocationUrl", "logoUrl", "name", "ticketingUrl", "updatedAt" FROM "Operator";
DROP TABLE "Operator";
ALTER TABLE "new_Operator" RENAME TO "Operator";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
