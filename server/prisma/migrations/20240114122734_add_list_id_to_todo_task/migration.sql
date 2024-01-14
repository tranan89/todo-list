/*
  Warnings:

  - Added the required column `listId` to the `TodoTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TodoTask" ADD COLUMN     "listId" INTEGER NOT NULL;
