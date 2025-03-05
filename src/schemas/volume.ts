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

export const volumeSchema = objectAsync({
  title: pipeAsync(string(), nonEmpty()),
  count: pipeAsync(number(), minValue(0)),
});

export const createVolumeSchema = intersectAsync([
  volumeSchema,
  objectAsync({
    serieId: pipeAsync(string(), nonEmpty()),
  }),
]);

export const updateVolumeSchema = partialAsync(volumeSchema);
