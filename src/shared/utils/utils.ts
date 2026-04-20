import { ValidationError } from "@nestjs/common";

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): Record<string, string> {
  const details: Record<string, string> = {};
  for (const err of errors) {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property;
    if (err.constraints) {
      details[path] = Object.values(err.constraints)[0];
    }
    if (err.children?.length) {
      Object.assign(details, flattenValidationErrors(err.children, path));
    }
  }
  return details;
}