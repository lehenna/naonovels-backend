import { prisma } from "@/lib/prisma";
import {
  checkAsync,
  maxLength,
  minLength,
  objectAsync,
  pipeAsync,
  string,
} from "valibot";

export const createTeamSchema = objectAsync({
  name: pipeAsync(
    string(),
    minLength(2),
    maxLength(20),
    checkAsync(async (input) => {
      const user = await prisma.profile.findFirst({
        where: {
          identifier: input.toLowerCase().trim(),
        },
      });
      return !Boolean(user);
    }, "Not available.")
  ),
});
