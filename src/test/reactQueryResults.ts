import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

export function querySuccess<TData>(data: TData): UseQueryResult<TData> {
  const result: UseQueryResult<TData> = {
    data,
    dataUpdatedAt: 1,
    error: null,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isLoading: false,
    isPending: false,
    isLoadingError: false,
    // TanStack Query 5 still requires this deprecated field in its result type.
    // oxlint-disable-next-line typescript/no-deprecated
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    isEnabled: true,
    refetch: () => Promise.resolve(result),
    status: "success",
    fetchStatus: "idle",
  };
  return result;
}

export function queryLoading<TData>(): UseQueryResult<TData> {
  const result: UseQueryResult<TData> = {
    data: undefined,
    dataUpdatedAt: 0,
    error: null,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isError: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: true,
    isLoading: true,
    isPending: true,
    isLoadingError: false,
    // TanStack Query 5 still requires this deprecated field in its result type.
    // oxlint-disable-next-line typescript/no-deprecated
    isInitialLoading: true,
    isPaused: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: true,
    isSuccess: false,
    isEnabled: true,
    refetch: () => Promise.resolve(result),
    status: "pending",
    fetchStatus: "fetching",
  };
  return result;
}

export function queryError<TData>(error: Error): UseQueryResult<TData> {
  const result: UseQueryResult<TData> = {
    data: undefined,
    dataUpdatedAt: 0,
    error,
    errorUpdatedAt: 1,
    failureCount: 1,
    failureReason: error,
    errorUpdateCount: 1,
    isError: true,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isLoading: false,
    isPending: false,
    isLoadingError: true,
    // TanStack Query 5 still requires this deprecated field in its result type.
    // oxlint-disable-next-line typescript/no-deprecated
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: false,
    isEnabled: true,
    refetch: () => Promise.resolve(result),
    status: "error",
    fetchStatus: "idle",
  };
  return result;
}

type MutationResult<TData, TVariables> = UseMutationResult<
  TData,
  Error,
  TVariables
>;

export function mutationIdle<TData, TVariables>(
  callbacks: Partial<
    Pick<MutationResult<TData, TVariables>, "mutate" | "mutateAsync">
  > = {},
): MutationResult<TData, TVariables> {
  return {
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    variables: undefined,
    submittedAt: 0,
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    status: "idle",
    mutate:
      callbacks.mutate ??
      (() => {
        throw new Error("Unexpected mutation in test");
      }),
    mutateAsync:
      callbacks.mutateAsync ??
      (() => Promise.reject(new Error("Unexpected mutation in test"))),
    reset: () => undefined,
  };
}
