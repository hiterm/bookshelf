import { ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import { atom } from "recoil";

export const bookListFilter = atom<ColumnFiltersState>({
  key: "BookListFilter",
  default: [],
});

export const bookListSorting = atom<SortingState>({
  key: "BookListSorting",
  default: [],
});

export const bookListColumnVisibility = atom<VisibilityState>({
  key: "BookListColumnVisibility",
  default: {},
});
