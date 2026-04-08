-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuCategory" (
    "menu_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("menu_id", "category_id"),
    CONSTRAINT "MenuCategory_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MenuCategory" ("category_id", "menu_id", "order") SELECT "category_id", "menu_id", "order" FROM "MenuCategory";
DROP TABLE "MenuCategory";
ALTER TABLE "new_MenuCategory" RENAME TO "MenuCategory";
CREATE TABLE "new_MenuProductPrice" (
    "menu_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    PRIMARY KEY ("menu_id", "product_id"),
    CONSTRAINT "MenuProductPrice_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuProductPrice_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MenuProductPrice" ("menu_id", "price", "product_id") SELECT "menu_id", "price", "product_id" FROM "MenuProductPrice";
DROP TABLE "MenuProductPrice";
ALTER TABLE "new_MenuProductPrice" RENAME TO "MenuProductPrice";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
