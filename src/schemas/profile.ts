import { prisma } from "@/lib/prisma";
import {
  checkAsync,
  instance,
  maxLength,
  minLength,
  nonEmpty,
  objectAsync,
  partialAsync,
  pipeAsync,
  string,
} from "valibot";

export const ProfileSchema = partialAsync(
  objectAsync({
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
    biography: pipeAsync(string(), nonEmpty(), maxLength(160)),
    avatar: pipeAsync(
      instance(File),
      checkAsync((input) => {
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        return validTypes.includes(input.type);
      }, "Must be an image")
    ),
    cover: pipeAsync(
      instance(File),
      checkAsync((input) => {
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        return validTypes.includes(input.type);
      }, "Must be an image")
    ),
  })
);
