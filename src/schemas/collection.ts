import {
  boolean,
  nonEmpty,
  objectAsync,
  optional,
  partialAsync,
  pipeAsync,
  string,
} from "valibot";

export const collectionSchema = objectAsync({
  name: pipeAsync(string(), nonEmpty()),
  isPublic: optional(boolean()),
});

export const updateCollectionSchema = partialAsync(collectionSchema);
