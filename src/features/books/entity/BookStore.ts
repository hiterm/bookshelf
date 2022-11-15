import { BookStore } from "../../../generated/graphql";

export const BOOK_STORE_VALUE: BookStore[] = ["UNKNOWN", "KINDLE"];

export const displayBookStore = (store: BookStore): string => {
  switch (store) {
    case "KINDLE":
      return "Kindle";
    case "UNKNOWN":
      return "Unknown";
  }
};
