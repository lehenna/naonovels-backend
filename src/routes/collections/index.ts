import { strictGetUserSession } from "@/helpers/user-session";
import { APIError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { validation } from "@/lib/valibot";
import { collectionSchema, updateCollectionSchema } from "@/schemas/collection";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";

const routes = new Hono();

routes.get("/", async (c) => {
  const session = await strictGetUserSession(c);
  const collections = await prisma.collection.findMany({
    where: {
      user: {
        id: session.user.id,
      },
    },
    select: {
      id: true,
      isPublic: true,
      name: true,
      _count: {
        select: {
          series: true,
        },
      },
    },
  });
  const dto = collections.map((collection) => ({
    id: collection.id,
    isPublic: collection.isPublic,
    name: collection.name,
    series: collection._count.series,
  }));
  return c.json(dto);
});

routes.get("/:collectionId", async (c) => {
  const { collectionId } = c.req.param();
  const collectionMetadata = await prisma.collection.findUnique({
    where: {
      id: collectionId,
    },
    select: {
      id: true,
      isPublic: true,
      userId: true,
    },
  });
  if (!collectionMetadata) throw new APIError(404, "Collection not found");
  if (!collectionMetadata.isPublic) {
    const session = await strictGetUserSession(c);
    if (collectionMetadata.userId !== session.user.id)
      throw new APIError(403, "Forbidden");
  }
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
    },
    select: {
      id: true,
      isPublic: true,
      name: true,
      user: {
        select: {
          id: true,
          profile: {
            select: {
              name: true,
              identifier: true,
              avatar: true,
            },
          },
        },
      },
      series: {
        select: {
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
  });
  if (!collection) throw new APIError(404, "Collection not found");
  const dto = {
    id: collection.id,
    isPublic: collection.isPublic,
    name: collection.name,
    user: {
      id: collection.user.id,
      name: collection.user.profile.name,
      identifier: collection.user.profile.identifier,
      avatar: collection.user.profile.avatar,
    },
    series: collection.series.map((item) => ({
      id: item.serie.id,
      icon: item.serie.icon,
      title: item.serie.title,
      format: item.serie.format,
      genres: item.serie.genres,
      state: item.serie.state,
    })),
  };
  return c.json(dto);
});

routes.post("/", async (c) => {
  const session = await strictGetUserSession(c);
  const jsonData = await c.req.json();
  const data = await validation(collectionSchema, jsonData);
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      isPublic: data.isPublic,
      user: {
        connect: {
          id: session.user.id,
        },
      },
    },
    select: {
      id: true,
      isPublic: true,
      name: true,
    },
  });
  return c.json(collection);
});

routes.put("/:collectionId", async (c) => {
  const session = await strictGetUserSession(c);
  const jsonData = await c.req.json();
  const data = await validation(updateCollectionSchema, jsonData);
  const { collectionId } = c.req.param();
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
    },
  });
  if (!collection) throw new APIError(404, "Collection not found");
  if (collection.userId !== session.user.id)
    throw new APIError(403, "Forbidden");
  const newData: Prisma.CollectionUpdateInput = {};
  if (data.name) newData.name = data.name;
  if (typeof data.isPublic === "boolean") newData.isPublic = data.isPublic;
  const updatedCollection = await prisma.collection.update({
    where: {
      id: collectionId,
    },
    data: newData,
    select: {
      id: true,
    },
  });
  return c.json({
    id: updatedCollection.id,
  });
});

routes.delete("/:collectionId", async (c) => {
  const session = await strictGetUserSession(c);
  const { collectionId } = c.req.param();
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
    },
  });
  if (!collection) throw new APIError(404, "Collection not found");
  if (collection.userId !== session.user.id)
    throw new APIError(403, "Forbidden");
  const deletedCollection = await prisma.collection.delete({
    where: {
      id: collectionId,
    },
    select: {
      id: true,
    },
  });
  return c.json({
    id: deletedCollection.id,
  });
});

export { routes as CollectionRoutes };
