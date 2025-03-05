import * as jose from "jose";
import ms from "ms";
import { nanoid } from "nanoid";

import { APIError } from "@/lib/error";
import { mailer } from "./mailer";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const JWT_EXPIRES_IN = "15d";

export async function authenticate(email: string) {
  email = email.toLowerCase().trim();
  const identifier = `user-${nanoid(15)}`.toLowerCase();
  const user = await prisma.user.upsert({
    where: {
      email,
    },
    create: {
      email,
      profile: {
        create: {
          name: identifier,
          identifier,
        },
      },
    },
    update: {},
  });
  return user;
}

export async function sendAuthLink(user: User) {
  const secret = nanoid();
  const authLink = await prisma.authLink.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      expiresAt: new Date(Date.now() + ms("10m")),
      secret: await Bun.password.hash(secret),
    },
  });
  const token = `${authLink.id}::${secret}`;
  const html = `<p><a href="http://localhost:3000/verification?token=${token}" target="_blank">Verification</a></p>`;
  await mailer.send({
    to: user.email,
    subject: "Verification",
    html,
  });
}

export async function validateAuthLink(link: string) {
  const [id, secret] = link.split("::");
  const authLink = await prisma.authLink.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      secret: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!authLink) throw new APIError(400, "Invalid token.");
  if (authLink.expiresAt.getTime() < Date.now()) {
    await prisma.authLink.delete({
      where: {
        id: authLink.id,
      },
    });
    throw new APIError(400, "Invalid token.");
  }
  const isValidSecret = await Bun.password.verify(secret, authLink.secret);
  if (!isValidSecret) throw new APIError(400, "Invalid token.");
  await prisma.authLink.delete({
    where: {
      id: authLink.id,
    },
  });
  return authLink.user;
}

export async function createUserSession(data: {
  user: User;
  ipAddress?: string;
  deviceName?: string;
  deviceVersion?: string;
  browserName?: string;
  browserVersion?: string;
  city?: string;
  country?: string;
}) {
  const session = await prisma.session.create({
    data: {
      ...data,
      user: {
        connect: {
          id: data.user.id,
        },
      },
    },
  });
  return session;
}

export async function createAccessToken(sessionId: string) {
  return await new jose.SignJWT({ sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function validateAccessToken({
  token,
  ipAddress,
}: {
  token: string;
  ipAddress?: string;
}) {
  try {
    const { payload } = (await jose.jwtVerify(token, JWT_SECRET)) as {
      payload: { sessionId: string };
    };

    const session = await prisma.session.findUnique({
      where: {
        id: payload.sessionId,
      },
      select: {
        id: true,
        ipAddress: true,
        user: {
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
        },
      },
    });

    if (!session || session.ipAddress !== (ipAddress ?? null))
      throw new APIError(401, "Invalid access token.");

    return session;
  } catch {
    throw new APIError(401, "Invalid access token.");
  }
}
