import { ClientError } from "graphql-request";

export type AppError = {
  id: string;
  title: string;
  operation?: string;
  message: string;
  details?: string;
  occurredAt: Date;
};

export type ReportErrorInput = {
  title: string;
  operation?: string;
  error: unknown;
};

type NormalizedError = Pick<AppError, "message" | "details">;

const sensitiveKey =
  /authorization|api[-_]?key|cookie|credential|password|secret|token|header|variable/i;

const sanitizeExtensionValue = (value: unknown): unknown => {
  if (value == null || typeof value === "string" || typeof value === "boolean")
    return value;
  if (typeof value === "number")
    return Number.isFinite(value) ? value : "non-finite number";
  if (Array.isArray(value)) return value.map(sanitizeExtensionValue);
  return "[omitted non-scalar value]";
};

const sanitizeExtensions = (
  extensions: Readonly<Record<string, unknown>>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(extensions)
      .filter(([key]) => !sensitiveKey.test(key))
      .map(([key, value]) => [key, sanitizeExtensionValue(value)]),
  );

export const normalizeError = (error: unknown): NormalizedError => {
  if (error instanceof ClientError) {
    const graphqlErrors = error.response.errors?.map((graphqlError) => ({
      message: graphqlError.message,
      ...(graphqlError.path == null ? {} : { path: graphqlError.path }),
      extensions: sanitizeExtensions(graphqlError.extensions),
    }));
    const status = error.response.status;
    const details = {
      httpStatus: status,
      ...(graphqlErrors == null ? {} : { graphqlErrors }),
    };

    return {
      message:
        error.response.errors?.[0]?.message ??
        `GraphQL request failed (${String(status)})`,
      details: JSON.stringify(details, null, 2),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message === "" ? error.name : error.message,
      ...(error.stack == null ? {} : { details: error.stack }),
    };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return { message: "不明なエラーが発生しました" };
};

export const formatErrorForClipboard = (error: AppError): string =>
  [
    `Title: ${error.title}`,
    ...(error.operation == null ? [] : [`Operation: ${error.operation}`]),
    `Message: ${error.message}`,
    ...(error.details == null ? [] : ["Details:", error.details]),
    `Occurred at: ${error.occurredAt.toISOString()}`,
  ].join("\n");
