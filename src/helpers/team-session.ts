import { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";

import { APIError } from "@/lib/error";
import { validateTeamSession } from "@/utils/team";
import { strictGetUserSession } from "./user-session";

export async function getTeamSession(c: Context) {
  const team_session = getCookie(c, "team_session");
  if (team_session) {
    const session = await strictGetUserSession(c);
    const team = await validateTeamSession(team_session, session.user.id);
    if (!team) deleteCookie(c, "team_session");
    return team;
  }
  return null;
}

export async function strictGetTeamSession(c: Context) {
  const team = await getTeamSession(c);
  if (!team) throw new APIError(401, "Unauthorized.");
  return team;
}
