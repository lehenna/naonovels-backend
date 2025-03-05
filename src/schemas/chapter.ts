import {
  intersectAsync,
  minValue,
  nonEmpty,
  number,
  objectAsync,
  partialAsync,
  pipeAsync,
  string,
} from "valibot";

export const chapterSchema = objectAsync({
  title: pipeAsync(string(), nonEmpty()),
  count: pipeAsync(number(), minValue(0)),
});

export const createChapterSchema = intersectAsync([
  chapterSchema,
  objectAsync({
    volumeId: pipeAsync(string(), nonEmpty()),
  }),
]);

export const updateChapterSchema = partialAsync(chapterSchema);
