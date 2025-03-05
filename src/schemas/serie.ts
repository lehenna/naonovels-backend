import { FormatEnum, StateEnum } from "@/lib/constants";
import {
  arrayAsync,
  checkAsync,
  instance,
  nonEmpty,
  number,
  objectAsync,
  partialAsync,
  pipeAsync,
  string,
} from "valibot";

export const serieSchema = objectAsync({
  icon: pipeAsync(
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
  title: pipeAsync(string(), nonEmpty()),
  alternative: pipeAsync(string(), nonEmpty()),
  synopsis: pipeAsync(string(), nonEmpty()),
  format: pipeAsync(
    number(),
    checkAsync(async (input) => {
      return Object.values(FormatEnum).includes(input);
    }, "Invalid format.")
  ),
  state: pipeAsync(
    number(),
    checkAsync(async (input) => {
      return Object.values(StateEnum).includes(input);
    }, "Invalid state.")
  ),
  tags: arrayAsync(pipeAsync(string(), nonEmpty())),
  genres: arrayAsync(
    pipeAsync(
      number(),
      checkAsync(async (input) => {
        return Object.values(StateEnum).includes(input);
      }, "Invalid state.")
    )
  ),
  artists: arrayAsync(pipeAsync(string(), nonEmpty())),
  authors: arrayAsync(pipeAsync(string(), nonEmpty())),
});

export const updateSerieSchema = partialAsync(serieSchema);
