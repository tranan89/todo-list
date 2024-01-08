/*
  Warnings:

  - You are about to drop the column `list` on the `TodoList` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TodoList" DROP COLUMN "list",
ADD COLUMN     "taskIds" VARCHAR(255)[];
