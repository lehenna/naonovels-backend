import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { getConnInfo } from "hono/bun";
import { validation } from "@/lib/valibot";
import { signinSchema, verificationSchema } from "@/schemas/auth";
import { AuthServices } from "@/services/auth";
import { getGeoLocation } from "@/utils/geolocation";
import { getDeviceInformation } from "@/utils/get-device";

const routes = new Hono();

routes.post("/signin", async (c) => {
  const jsonData = await c.req.json();
  const { email } = await validation(signinSchema, jsonData);
  await AuthServices.signin({ email });
  return c.json({
    message: "ok",
  });
});

routes.post("/verification", async (c) => {
  const jsonData = await c.req.json();
  const { token } = await validation(verificationSchema, jsonData);
  const headers = c.req.header();
  const userAgent = headers["user-agent"];
  const connInfo = getConnInfo(c);
  const ipAddress = connInfo.remote.address;
  const geolocation = ipAddress ? await getGeoLocation(ipAddress) : {};
  const deviceInformation = userAgent
    ? await getDeviceInformation(userAgent)
    : {};
  const access_token = await AuthServices.verification({
    token,
    ipAddress,
    ...deviceInformation,
    ...geolocation,
  });
  setCookie(c, "access_token", access_token);
  return c.json({
    access_token,
  });
});

export { routes as AuthRoutes };
