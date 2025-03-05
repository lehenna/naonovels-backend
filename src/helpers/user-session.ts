import { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { deleteCookie, getCookie } from "hono/cookie";

import { validateAccessToken } from "@/utils/auth";
import { APIError } from "@/lib/error";

export async function getUserSession(c: Context) {
  const user_session = getCookie(c, "user_session");
  const connInfo = getConnInfo(c);
  if (user_session) {
    const session = await validateAccessToken({
      token: user_session,
      ipAddress: connInfo.remote.address ?? "",
    });
    if (!session) deleteCookie(c, "user_session");
    return session;
  }
  const headers = c.req.header();
  const headerToken = headers["Authorization"] ?? headers["authorization"];
  if (!headerToken || typeof headerToken !== "string") return null;
  const [_, accessToken] = headerToken.split("Bearer ");
  const session = await validateAccessToken({
    token: accessToken,
    ipAddress: connInfo.remote.address ?? "",
  });
  return session;
}

export async function strictGetUserSession(c: Context) {
  const session = await getUserSession(c);
  if (!session) throw new APIError(401, "Unauthorized.");
  return session;
}
