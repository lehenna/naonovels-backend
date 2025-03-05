import { Hono } from "hono";

import { strictGetUserSession } from "@/helpers/user-session";
import { validation } from "@/lib/valibot";
import { ProfileSchema } from "@/schemas/profile";
import { ProfileServices } from "@/services/profiles";
import { prisma } from "@/lib/prisma";

const routes = new Hono();

routes.get("/me", async (c) => {
  const session = await strictGetUserSession(c);
  const dto = {
    id: session.user.id,
    name: session.user.profile.name,
    identifier: session.user.profile.identifier,
    avatar: session.user.profile.avatar,
    cover: session.user.profile.cover,
    createdAt: session.user.createdAt,
  };
  return c.json(dto);
});

routes.put("/me", async (c) => {
  const session = await strictGetUserSession(c);
  const parsedBody = await c.req.parseBody();
  const data = await validation(ProfileSchema, parsedBody);
  const newData = await ProfileServices.createNewData(
    session.user.profile,
    data
  );
  await prisma.profile.update({
    where: {
      id: session.user.profile.id,
    },
    data: newData,
  });
  return c.json({
    message: "ok",
  });
});

export { routes as UserRoutes };
