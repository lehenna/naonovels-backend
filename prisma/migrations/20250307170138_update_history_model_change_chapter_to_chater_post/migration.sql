-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_chapterId_fkey";

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "ChapterPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
