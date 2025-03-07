import { Hono } from "hono";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const routes = new Hono();

routes.get("/", async (c) => {
  const { page = "1", teamId } = c.req.query();
  const currentPage = parseInt(page);
  const offset = (currentPage > 0 ? currentPage - 1 : 0) * 24;
  const where: Prisma.ChapterPostWhereInput = {};
  if (teamId) where.team = { id: teamId };
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
    id: post.id,
    title: post.chapter.title,
    count: post.chapter.count,
    serie: {
      id: post.chapter.volume.serie.id,
      icon: post.chapter.volume.serie.icon,
      title: post.chapter.volume.serie.title,
      format: post.chapter.volume.serie.format,
      genres: post.chapter.volume.serie.genres,
      state: post.chapter.volume.serie.state,
    },
    volume: {
      id: post.chapter.volume.id,
      title: post.chapter.volume.title,
      count: post.chapter.volume.count,
    },
    team: {
      id: post.team.id,
      identifier: post.team.profile.identifier,
      name: post.team.profile.name,
    },
  }));
  return c.json(dto);
});

export { routes as ChapterPostRoutes };
