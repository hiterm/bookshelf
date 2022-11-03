import { bool, mixed, object, string, writableArray, writableDict } from "@recoiljs/refine";
import { ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import { atom } from "recoil";
import { syncEffect } from "recoil-sync";

export const bookListFilter = atom<ColumnFiltersState>({
  key: "BookListFilter",
  default: [],
  effects: [
    syncEffect({ refine: writableArray(object({ id: string(), value: mixed() })) }),
  ],
});

export const bookListSorting = atom<SortingState>({
  key: "BookListSorting",
  default: [],
  effects: [
    syncEffect({ refine: writableArray(object({ id: string(), desc: bool() })) } as any),
  ],
});

export const bookListColumnVisibility = atom<VisibilityState>({
  key: "BookListColumnVisibility",
  default: {},
  effects: [
    syncEffect({ refine: writableDict(bool()) }),
  ],
});
