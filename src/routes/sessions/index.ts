import { Hono } from "hono";

import { strictGetUserSession } from "@/helpers/user-session";
import { APIError } from "@/lib/error";
import { prisma } from "@/lib/prisma";

const routes = new Hono();

routes.get("/", async (c) => {
  const session = await strictGetUserSession(c);
  const sessions = await prisma.session.findMany({
    where: {
      user: {
        id: session.user.id,
      },
    },
    select: {
      id: true,
      ipAddress: true,
      city: true,
      country: true,
      createdAt: true,
      browserName: true,
      browserVersion: true,
      deviceName: true,
      deviceVersion: true,
    },
  });
  return c.json(sessions);
});

routes.delete("/:sessionId", async (c) => {
  const session = await strictGetUserSession(c);
  const { sessionId } = c.req.param();
  const sessionToDelete = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!sessionToDelete) throw new APIError(404, "Session not found.");
  if (sessionToDelete.user.id !== session.user.id)
    throw new APIError(403, "Permission denied.");
  await prisma.session.delete({
    where: {
      id: sessionToDelete.id,
    },
  });
  return c.json({
    message: "ok",
  });
});

export { routes as SessionRoutes };
