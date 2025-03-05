import { APIError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "./crypto";

export async function createTeamSession(teamId: string, userId: string) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
    },
    select: {
      id: true,
      members: {
        where: {
          user: {
            id: userId,
          },
        },
      },
    },
  });
  if (!team) throw new APIError(404, "Team not found.");
  if (!team.members[0])
    throw new APIError(403, "You are not a member of the team.");
  const hashedTeamId = encrypt(team.id);
  return hashedTeamId;
}

export async function validateTeamSession(
  hashedTeamId: string,
  userId: string
) {
  const teamId = decrypt(hashedTeamId);
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
    },
    select: {
      id: true,
      members: {
        where: {
          user: {
            id: userId,
          },
        },
      },
    },
  });
  if (!team) throw new APIError(401, "Invalid team session.");
  if (!team.members[0])
    throw new APIError(403, "You are not a member of the team.");
  return team;
}
