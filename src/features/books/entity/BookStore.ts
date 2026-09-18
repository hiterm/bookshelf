import { BookStore } from "../../../generated/graphql-request";

export const BOOK_STORE_VALUE = [
  "UNKNOWN",
  "KINDLE",
] as const satisfies readonly BookStore[];

export const displayBookStore = (store: BookStore): string => {
  switch (store) {
    case "KINDLE":
      return "Kindle";
    case "UNKNOWN":
      return "Unknown";
  }
};
