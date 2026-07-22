-- DropIndex
DROP INDEX `Customer_email_key` ON `customer`;

-- CreateIndex
CREATE INDEX `Customer_email_idx` ON `Customer`(`email`);
