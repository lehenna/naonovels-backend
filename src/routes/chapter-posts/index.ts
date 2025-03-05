import { Hono } from "hono";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const routes = new Hono();

routes.get("/", async (c) => {
  const { page = "1", teamId } = c.req.query();
  const currentPage = parseInt(page);
  const offset = (currentPage > 0 ? currentPage - 1 : 0) * 24;
  const where: Prisma.ChapterPostWhereInput = {}
  if (teamId) where.
  const posts = await prisma.chapterPost.findMany({
    select: {
      id: true,
      team: {
        select: {
          id: true,
          profile: {
            select: {
              name: true,
              identifier: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          count: true,
          volume: {
            select: {
              id: true,
              title: true,
              count: true,
              serie: {
                select: {
                  id: true,
                  icon: true,
                  title: true,
                  format: true,
                  genres: true,
                  state: true,
                },
              },
            },
          },
        },
      },
    },
    take: 24,
    skip: offset,
    orderBy: {
      createdAt: "desc",
    },
  });
  const dto = posts.map((post) => ({
    id: post.chapter.id,
  }));
});

export { routes as ChapterPostRoutes };
