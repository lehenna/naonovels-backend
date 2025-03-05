import {
  authenticate,
  createAccessToken,
  createUserSession,
  sendAuthLink,
  validateAuthLink,
} from "@/utils/auth";

export class AuthServices {
  static async signin({ email }: { email: string }) {
    const user = await authenticate(email);
    await sendAuthLink(user);
  }

  static async verification({
    token,
    ipAddress,
    deviceName,
    deviceVersion,
    browserName,
    browserVersion,
    city,
    country,
  }: {
    token: string;
    ipAddress?: string;
    deviceName?: string;
    deviceVersion?: string;
    browserName?: string;
    browserVersion?: string;
    city?: string;
    country?: string;
  }) {
    const user = await validateAuthLink(token);
    const session = await createUserSession({
      user,
      ipAddress,
      deviceName,
      deviceVersion,
      browserName,
      browserVersion,
      city,
      country,
    });
    const access_token = await createAccessToken(session.id);
    return access_token;
  }
}
