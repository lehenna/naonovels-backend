import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";

export class APIError extends HTTPException {
  readonly issues?: Record<string, string>;

  constructor(
    status: ContentfulStatusCode,
    message: string,
    issues?: Record<string, string>
  ) {
    super(status, {
      message,
    });
    this.issues = issues;
  }

  getResponse(): Response {
    return Response.json(
      {
        message: this.message,
        issues: this.issues ?? {},
      },
      {
        status: this.status,
      }
    );
  }
}
