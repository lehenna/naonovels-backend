import { BaseSchemaAsync, flatten, safeParseAsync } from "valibot";
import { APIError } from "./error";

export async function validation<
  Output,
  Schema extends BaseSchemaAsync<any, Output, any>
>(schema: Schema, input: any) {
  const result = await safeParseAsync(schema, input);
  if (result.success) return result.output;
  const flattenIssues = flatten(result.issues);
  const issues: Record<string, string> = {};
  for (const fieldName in flattenIssues.nested) {
    const fieldIssues =
      flattenIssues.nested[fieldName as keyof typeof flattenIssues.nested];
    const message = fieldIssues?.pop();
    if (!message) continue;
    issues[fieldName] = message;
  }
  throw new APIError(400, "Validation error.", issues);
}
