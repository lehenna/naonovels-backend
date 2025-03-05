import { email, nonEmpty, objectAsync, pipeAsync, string } from "valibot";

export const signinSchema = objectAsync({
  email: pipeAsync(string(), email()),
});

export const verificationSchema = objectAsync({
  token: pipeAsync(string(), nonEmpty()),
});
