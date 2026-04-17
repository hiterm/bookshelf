import { BookFormat } from "../../../generated/graphql-request";

export const BOOK_FORMAT_VALUE = [
  "UNKNOWN",
  "E_BOOK",
  "PRINTED",
] as const satisfies readonly BookFormat[];

export const displayBookFormat = (format: BookFormat): string => {
  switch (format) {
    case "E_BOOK":
      return "eBook";
    case "PRINTED":
      return "Printed";
    case "UNKNOWN":
      return "Unknown";
  }
};
