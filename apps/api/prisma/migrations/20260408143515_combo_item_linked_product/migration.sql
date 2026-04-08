/*
  Warnings:

  - You are about to drop the column `parent_product_id` on the `Product` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ComboItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "combo_product_id" INTEGER NOT NULL,
    "product_id" INTEGER,
    "complement_type_id" INTEGER,
    CONSTRAINT "ComboItem_combo_product_id_fkey" FOREIGN KEY ("combo_product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ComboItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ComboItem_complement_type_id_fkey" FOREIGN KEY ("complement_type_id") REFERENCES "ProductComplementType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image_url" TEXT,
    "type" TEXT NOT NULL DEFAULT 'REGULAR',
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "content" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    CONSTRAINT "Product_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("content", "created_at", "description", "id", "image_url", "is_available", "name", "price", "type", "updated_at", "workspace_id") SELECT "content", "created_at", "description", "id", "image_url", "is_available", "name", "price", "type", "updated_at", "workspace_id" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_ProductComplement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "increment" BOOLEAN NOT NULL DEFAULT false,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "product_complement_type_id" INTEGER NOT NULL,
    "linked_product_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ProductComplement_product_complement_type_id_fkey" FOREIGN KEY ("product_complement_type_id") REFERENCES "ProductComplementType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductComplement_linked_product_id_fkey" FOREIGN KEY ("linked_product_id") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductComplement" ("created_at", "id", "increment", "is_disabled", "name", "price", "product_complement_type_id", "updated_at") SELECT "created_at", "id", "increment", "is_disabled", "name", "price", "product_complement_type_id", "updated_at" FROM "ProductComplement";
DROP TABLE "ProductComplement";
ALTER TABLE "new_ProductComplement" RENAME TO "ProductComplement";
CREATE TABLE "new_ProductComplementType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "min_selectable" INTEGER NOT NULL DEFAULT 0,
    "max_selectable" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    CONSTRAINT "ProductComplementType_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductComplementType" ("created_at", "id", "max_selectable", "name", "required", "updated_at", "workspace_id") SELECT "created_at", "id", "max_selectable", "name", "required", "updated_at", "workspace_id" FROM "ProductComplementType";
DROP TABLE "ProductComplementType";
ALTER TABLE "new_ProductComplementType" RENAME TO "ProductComplementType";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
