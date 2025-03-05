import { strictGetTeamSession } from "@/helpers/team-session";
import { APIError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { validation } from "@/lib/valibot";
import { serieSchema, updateSerieSchema } from "@/schemas/serie";
import { upload } from "@/utils/upload";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { nanoid } from "nanoid";

const routes = new Hono();

routes.get("/", async (c) => {
  const { page = "1", query } = c.req.query();
  const currentPage = parseInt(page);
  const offset = (currentPage > 0 ? currentPage - 1 : 0) * 24;
  const where: Prisma.SerieWhereInput = {};
  if (query && query.length >= 2) {
    where.title = {
      contains: query,
    };
  }
  const series = await prisma.serie.findMany({
    where,
    take: 24,
    skip: offset,
    select: {
      id: true,
      icon: true,
      title: true,
      format: true,
      genres: true,
      state: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return c.json(series);
});

routes.get("/:serieId", async (c) => {
  const { serieId } = c.req.param();
  const serie = await prisma.serie.findUnique({
    where: {
      id: serieId,
    },
    select: {
      id: true,
      icon: true,
      title: true,
      format: true,
      genres: true,
      state: true,
      cover: true,
      alternative: true,
      artists: true,
      authors: true,
      synopsis: true,
      tags: true,
      volumes: {
        select: {
          id: true,
          title: true,
          count: true,
          chapters: {
            select: {
              id: true,
              title: true,
              count: true,
              posts: {
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
                },
              },
            },
          },
        },
      },
    },
  });
  if (!serie) throw new APIError(404, "Serie not found.");
  const dto = {
    id: serie.id,
    icon: serie.icon,
    cover: serie.cover,
    title: serie.title,
    alternative: serie.alternative,
    synopsis: serie.synopsis,
    format: serie.format,
    state: serie.state,
    tags: serie.tags,
    genres: serie.genres,
    artists: serie.artists,
    authors: serie.authors,
    volumes: serie.volumes.map((volume) => ({
      id: volume.id,
      title: volume.title,
      count: volume.count,
      chapters: volume.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        count: chapter.count,
        posts: chapter.posts.map((post) => ({
          id: post.id,
          team: {
            id: post.team.id,
            identifier: post.team.profile.identifier,
            name: post.team.profile.name,
          },
        })),
      })),
    })),
  };
  return c.json(dto);
});

routes.post("/", async (c) => {
  const parsedBody = await c.req.parseBody();
  const data = await validation(serieSchema, parsedBody);
  await strictGetTeamSession(c);
  const iconFileName = `serie-icon-${nanoid()}.png`;
  await upload(iconFileName, data.icon);
  const coverFileName = `serie-icon-${nanoid()}.png`;
  await upload(coverFileName, data.cover);
  const serie = await prisma.serie.create({
    data: {
      title: data.title,
      alternative: data.alternative,
      cover: iconFileName,
      icon: coverFileName,
      format: data.format,
      state: data.state,
      synopsis: data.synopsis,
      tags: data.tags,
      artists: data.artists,
      authors: data.authors,
      genres: data.genres,
    },
    select: {
      id: true,
    },
  });
  return c.json(serie);
});

routes.put("/:serieId", async (c) => {
  const parsedBody = await c.req.parseBody();
  const data = await validation(updateSerieSchema, parsedBody);
  await strictGetTeamSession(c);
  const { serieId } = c.req.param();
  const serie = await prisma.serie.findUnique({
    where: {
      id: serieId,
    },
    select: {
      id: true,
    },
  });
  if (!serie) throw new APIError(404, "Serie not found.");
  const newData: Prisma.SerieUpdateInput = {};
  if (data.title) newData.title = data.title;
  if (typeof data.format === "number") newData.format = data.format;
  if (typeof data.state === "number") newData.state = data.state;
  if (data.tags) newData.tags = data.tags;
  if (data.synopsis) newData.synopsis = data.synopsis;
  if (data.alternative) newData.alternative = data.alternative;
  if (data.artists) newData.artists = data.artists;
  if (data.authors) newData.authors = data.authors;
  if (data.genres) newData.genres = data.genres;
  if (data.icon) {
    const iconFileName = `serie-icon-${nanoid()}.png`;
    await upload(iconFileName, data.icon);
    newData.icon = iconFileName;
  }
  if (data.cover) {
    const coverFileName = `serie-cover-${nanoid()}.png`;
    await upload(coverFileName, data.cover);
    newData.cover = coverFileName;
  }
  await prisma.serie.update({
    where: {
      id: serie.id,
    },
    data: newData,
  });
  return c.json({
    message: "ok",
  });
});

export { routes as SerieRoutes };
