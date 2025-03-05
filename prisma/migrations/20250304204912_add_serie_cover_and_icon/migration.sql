/*
  Warnings:

  - Added the required column `cover` to the `Serie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `Serie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Serie" ADD COLUMN     "cover" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL;
