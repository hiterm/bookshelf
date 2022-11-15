import { BookFormat } from "../../../generated/graphql";

export const BOOK_FORMAT_VALUE: BookFormat[] = ["UNKNOWN", "E_BOOK", "PRINTED"];

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
