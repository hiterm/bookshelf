import {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { getRouteApi } from "@tanstack/react-router";
import { bookColumnFiltersSchema, bookSortingSchema } from "./bookSearch";

const DEFAULT_PAGE_SIZE = 20;

export const useBookTableSearchState = () => {
  const routeApi = getRouteApi("/books/");
  const navigate = routeApi.useNavigate();
  const search = routeApi.useSearch();

  const columnFilters = search.columnFilters ?? [];
  const sorting = search.sorting ?? [];
  const pagination = {
    pageIndex: search.pageIndex ?? 0,
    pageSize: search.pageSize ?? DEFAULT_PAGE_SIZE,
  };

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next =
      typeof updater === "function" ? updater(columnFilters) : updater;
    if (JSON.stringify(next) === JSON.stringify(columnFilters)) return;
    const parsed = bookColumnFiltersSchema.safeParse(next);
    if (!parsed.success) return;
    void navigate({
      search: (prev) => ({
        ...prev,
        columnFilters: parsed.data.length === 0 ? undefined : parsed.data,
        pageIndex: undefined,
      }),
      replace: true,
    });
  };

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (JSON.stringify(next) === JSON.stringify(sorting)) return;
    const parsed = bookSortingSchema.safeParse(next);
    if (!parsed.success) return;
    void navigate({
      search: (prev) => ({
        ...prev,
        sorting: parsed.data.length === 0 ? undefined : parsed.data,
        pageIndex: undefined,
      }),
      replace: true,
    });
  };

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    if (
      next.pageIndex === pagination.pageIndex &&
      next.pageSize === pagination.pageSize
    )
      return;
    void navigate({
      search: (prev) => ({
        ...prev,
        pageIndex: next.pageIndex === 0 ? undefined : next.pageIndex,
        pageSize:
          next.pageSize === 50 || next.pageSize === 100
            ? next.pageSize
            : undefined,
      }),
      replace: true,
    });
  };

  const applyUnreadOwnedPreset = () => {
    void navigate({
      search: (prev) => ({
        ...prev,
        columnFilters: [
          { id: "read", value: false },
          { id: "owned", value: true },
        ],
        sorting: [{ id: "priority", desc: true }],
        pageIndex: undefined,
      }),
      replace: true,
    });
  };

  const resetSearch = () => {
    void navigate({ search: {}, replace: true });
  };

  return {
    state: { columnFilters, sorting, pagination },
    onColumnFiltersChange,
    onSortingChange,
    onPaginationChange,
    applyUnreadOwnedPreset,
    resetSearch,
  };
};
