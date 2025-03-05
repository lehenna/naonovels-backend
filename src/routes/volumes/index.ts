import { Hono } from "hono";
import { Prisma } from "@prisma/client";

import { strictGetTeamSession } from "@/helpers/team-session";
import { APIError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { validation } from "@/lib/valibot";
import { createVolumeSchema, updateVolumeSchema } from "@/schemas/volume";

const routes = new Hono();

routes.use(async (c, next) => {
  await strictGetTeamSession(c);
  return next();
});

routes.post("/", async (c) => {
  const jsonData = await c.req.json();
  const data = await validation(createVolumeSchema, jsonData);
  const serie = await prisma.serie.findUnique({
    where: {
      id: data.serieId,
    },
  });
  if (!serie) throw new APIError(404, "Serie not found.");
  const volumeExists = await prisma.volume.findFirst({
    where: {
      count: data.count,
      serie: {
        id: serie.id,
      },
    },
  });
  if (volumeExists) throw new APIError(400, "Volume already exists.");
  const newVolume = await prisma.volume.create({
    data: {
      title: data.title,
      count: data.count,
      serie: {
        connect: {
          id: serie.id,
        },
      },
    },
  });
  return c.json(newVolume);
});

routes.put("/:volumeId", async (c) => {
  const jsonData = await c.req.json();
  const data = await validation(updateVolumeSchema, jsonData);
  const { volumeId } = c.req.param();
  const volume = await prisma.volume.findFirst({
    where: {
      id: volumeId,
    },
  });
  if (!volume) throw new APIError(404, "Volume not found.");
  const newData: Prisma.VolumeUpdateInput = {};
  if (typeof data.count === "number") {
    const volumeExists = await prisma.volume.findFirst({
      where: {
        count: data.count,
        serie: {
          id: volume.serieId,
        },
      },
    });
    if (volumeExists) throw new APIError(400, "Volume already exists.");
    newData.count = data.count;
  }
  if (data.title) newData.title = data.title;
  await prisma.volume.update({
    where: {
      id: volume.id,
    },
    data: newData,
  });
  return c.json({
    message: "ok",
  });
});

export { routes as VolumeRoutes };
