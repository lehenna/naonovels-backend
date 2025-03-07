import { strictGetUserSession } from "@/helpers/user-session";
import { prisma } from "@/lib/prisma";
import { validation } from "@/lib/valibot";
import { deleteHistorySchema } from "@/schemas/history";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";

const routes = new Hono();

routes.get("/", async (c) => {
  const session = await strictGetUserSession(c);
  const history = await prisma.history.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      createdAt: true,
      chapter: {
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
      },
    },
  });
  const dto = history.map(({ chapter: post }) => ({
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

routes.delete("/", async (c) => {
  const session = await strictGetUserSession(c);
  const jsonData = await c.req.json();
  const { time } = await validation(deleteHistorySchema, jsonData);
  const where: Prisma.HistoryWhereInput = {
    userId: session.user.id,
  };
  if (time)
    where.createdAt = {
      lte: new Date(Date.now() - time * 60 * 1000),
    };
  await prisma.history.deleteMany({
    where,
  });
  return c.json({
    success: true,
  });
});

export { routes as HistoryRoutes };
