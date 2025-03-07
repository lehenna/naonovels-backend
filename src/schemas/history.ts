import {
  minValue,
  number,
  objectAsync,
  optionalAsync,
  pipeAsync,
} from "valibot";

export const deleteHistorySchema = objectAsync({
  time: optionalAsync(pipeAsync(number(), minValue(30))),
});
