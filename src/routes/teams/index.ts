import { Hono } from "hono";

import { APIError } from "@/lib/error";
import { validation } from "@/lib/valibot";
import { createTeamSchema } from "@/schemas/create-team";
import { ProfileServices } from "@/services/profiles";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { strictGetUserSession } from "@/helpers/user-session";
import { ProfileSchema } from "@/schemas/profile";

const routes = new Hono();

routes.get("/", async (c) => {
  const {
    page = "1",
    sort = "name",
    order = "asc",
    isMember = "0",
  } = c.req.query();
  if (sort !== "name" && sort !== "createdAt")
    throw new APIError(400, "Invalid sort.");
  const where: Prisma.TeamWhereInput = {};
  if (isMember === "1") {
    const session = await strictGetUserSession(c);
    where.members = {
      some: {
        user: {
          id: session.user.id,
        },
      },
    };
  }
  const currentPage = parseInt(page);
  const teams = await prisma.team.findMany({
    where,
    take: 20,
    skip: (currentPage > 0 ? currentPage - 1 : 0) * 20,
    select: {
      id: true,
      createdAt: true,
      profile: {
        select: {
          id: true,
          avatar: true,
          cover: true,
          name: true,
          identifier: true,
        },
      },
    },
    orderBy: {
      [sort]: order,
    },
  });
  const dto = teams.map((team) => ({
    id: team.id,
    name: team.profile.name,
    identifier: team.profile.identifier,
    avatar: team.profile.avatar,
    cover: team.profile.cover,
    createdAt: team.createdAt,
  }));
  return c.json(dto);
});

routes.get("/:teamId", async (c) => {
  const { teamId } = c.req.param();
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      id: true,
      createdAt: true,
      profile: {
        select: {
          id: true,
          avatar: true,
          cover: true,
          name: true,
          identifier: true,
          biography: true,
        },
      },
      members: {
        select: {
          id: true,
          isCreator: true,
          isPending: true,
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
        },
      },
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });
  if (!team) throw new APIError(404, "Team not found.");
  const dto = {
    id: team.id,
    name: team.profile.name,
    identifier: team.profile.identifier,
    avatar: team.profile.avatar,
    cover: team.profile.cover,
    createdAt: team.createdAt,
    posts: team._count.posts,
    members: team.members.map((member) => ({
      id: member.id,
      user: {
        id: member.user.id,
        identifier: member.user.profile.identifier,
        name: member.user.profile.name,
        avatar: member.user.profile.avatar,
      },
    })),
  };
  return c.json(dto);
});

routes.post("/", async (c) => {
  const session = await strictGetUserSession(c);
  const jsonData = await c.req.json();
  const data = await validation(createTeamSchema, jsonData);
  const newTeam = await prisma.team.create({
    data: {
      profile: {
        create: {
          name: data.name,
          identifier: data.name.toLowerCase().trim(),
        },
      },
      members: {
        create: {
          isCreator: true,
          isPending: false,
          user: {
            connect: {
              id: session.user.id,
            },
          },
        },
      },
    },
    select: {
      profile: {
        select: {
          identifier: true,
        },
      },
    },
  });
  return c.json({
    identifier: newTeam.profile.identifier,
  });
});

routes.put("/:teamId", async (c) => {
  const { teamId } = c.req.param();
  const session = await strictGetUserSession(c);
  const parsedBody = await c.req.parseBody();
  const data = await validation(ProfileSchema, parsedBody);
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      id: true,
      profile: {
        select: {
          id: true,
        },
      },
      members: {
        where: {
          user: {
            id: session.user.id,
          },
        },
      },
    },
  });
  if (!team) throw new APIError(404, "Team not found.");
  if (team.members.length === 0) throw new APIError(403, "Forbidden");
  const newData = await ProfileServices.createNewData(
    session.user.profile,
    data
  );
  await prisma.profile.update({
    where: {
      id: team.profile.id,
    },
    data: newData,
  });
  return c.json({
    message: "ok",
  });
});

routes.delete("/:teamId", async (c) => {
  const { teamId } = c.req.param();
  const session = await strictGetUserSession(c);
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      id: true,
      profile: {
        select: {
          id: true,
        },
      },
      members: {
        where: {
          user: {
            id: session.user.id,
          },
        },
      },
    },
  });
  if (!team) throw new APIError(404, "Team not found.");
  if (team.members.length === 0 || !team.members[0].isCreator)
    throw new APIError(403, "Forbidden");
  await prisma.profile.delete({
    where: {
      id: team.profile.id,
    },
  });
  await prisma.team.delete({
    where: {
      id: team.id,
    },
  });
  return c.json({
    message: "ok",
  });
});

export { routes as TeamRoutes };
