/*
  Warnings:

  - You are about to drop the column `operatorId` on the `RouteStop` table. All the data in the column will be lost.
  - You are about to drop the column `operatorId` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `routeId` to the `RouteStop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routeId` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operatorId" TEXT NOT NULL,
    "routeName" TEXT,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Route_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RouteStop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "island" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RouteStop" ("id", "island", "order") SELECT "id", "island", "order" FROM "RouteStop";
DROP TABLE "RouteStop";
ALTER TABLE "new_RouteStop" RENAME TO "RouteStop";
CREATE TABLE "new_Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "departureTimes" TEXT NOT NULL,
    "daysOfWeek" TEXT NOT NULL,
    CONSTRAINT "Schedule_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Schedule" ("daysOfWeek", "departureTimes", "id") SELECT "daysOfWeek", "departureTimes", "id" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
CREATE UNIQUE INDEX "Schedule_routeId_key" ON "Schedule"("routeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
