/*
  Warnings:

  - The `taskIds` column on the `TodoList` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TodoList" DROP COLUMN "taskIds",
ADD COLUMN     "taskIds" INTEGER[];
