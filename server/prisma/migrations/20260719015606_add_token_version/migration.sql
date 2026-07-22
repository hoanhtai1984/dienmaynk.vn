-- AlterTable
ALTER TABLE `admin` ADD COLUMN `tokenVersion` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `tokenVersion` INTEGER NOT NULL DEFAULT 0;
