import { getUserSession } from "@/helpers/user-session";
import { APIError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { Hono } from "hono";

const routes = new Hono();

routes.get("/:identifier", async (c) => {
  const { identifier } = c.req.param();
  const session = await getUserSession(c);
  const profile = await prisma.profile.findUnique({
    where: {
      identifier,
    },
    select: {
      avatar: true,
      cover: true,
      name: true,
      identifier: true,
      biography: true,
      user: {
        select: {
          id: true,
          _count: {
            select: {
              following: true,
              history: true,
            },
          },
          createdAt: true,
        },
      },
      team: {
        select: {
          _count: {
            select: {
              posts: true,
              members: true,
            },
          },
          id: true,
          createdAt: true,
        },
      },
      followers: session
        ? {
            where: {
              user: {
                id: session.user.id,
              },
            },
            select: {
              id: true,
            },
          }
        : false,
      _count: {
        select: {
          followers: true,
        },
      },
    },
  });
  if (!profile) throw new APIError(404, "Profile not found.");
  const team = profile.team[0];
  const dto: Record<string, any> = {
    isFollowed: profile.followers.length > 0,
    name: profile.name,
    identifier: profile.identifier,
    avatar: profile.avatar,
    cover: profile.cover,
  };
  if (team) {
    dto.id = team.id;
    dto.members = team._count.members;
    dto.posts = team._count.posts;
    dto.createdAt = team.createdAt;
  }
  const user = profile.user[0];
  if (user) {
    dto.id = user.id;
    dto.following = user._count.following;
    dto.chapters = user._count.history;
    dto.createdAt = user.createdAt;
  }
  return c.json(dto);
});

export { routes as ProfileRoutes };
