import { Hono } from "hono";
import { Prisma } from "@prisma/client";

import { strictGetTeamSession } from "@/helpers/team-session";
import { APIError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { validation } from "@/lib/valibot";
import { createChapterSchema, updateChapterSchema } from "@/schemas/chapter";

const routes = new Hono();

routes.use(async (c, next) => {
  await strictGetTeamSession(c);
  return next();
});

routes.post("/", async (c) => {
  const jsonData = await c.req.json();
  const data = await validation(createChapterSchema, jsonData);
  const volume = await prisma.volume.findUnique({
    where: {
      id: data.volumeId,
    },
  });
  if (!volume) throw new APIError(404, "Volume not found.");
  const chapterExists = await prisma.chapter.findFirst({
    where: {
      count: data.count,
      volume: {
        id: volume.id,
      },
    },
  });
  if (chapterExists) throw new APIError(400, "Chapter already exists.");
  const newchapter = await prisma.chapter.create({
    data: {
      title: data.title,
      count: data.count,
      volume: {
        connect: {
          id: volume.id,
        },
      },
    },
  });
  return c.json(newchapter);
});

routes.put("/:chapterId", async (c) => {
  const jsonData = await c.req.json();
  const data = await validation(updateChapterSchema, jsonData);
  const { chapterId } = c.req.param();
  const chapter = await prisma.chapter.findFirst({
    where: {
      id: chapterId,
    },
  });
  if (!chapter) throw new APIError(404, "Chapter not found.");
  const newData: Prisma.ChapterUpdateInput = {};
  if (typeof data.count === "number") {
    const chapterExists = await prisma.chapter.findFirst({
      where: {
        count: data.count,
        volume: {
          id: chapter.volumeId,
        },
      },
    });
    if (chapterExists) throw new APIError(400, "Chapter already exists.");
    newData.count = data.count;
  }
  if (data.title) newData.title = data.title;
  await prisma.chapter.update({
    where: {
      id: chapter.id,
    },
    data: newData,
  });
  return c.json({
    message: "ok",
  });
});

export { routes as ChapterRoutes };
