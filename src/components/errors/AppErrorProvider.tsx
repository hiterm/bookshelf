import { showNotification } from "@mantine/notifications";
import type { QueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  normalizeError,
  type AppError,
  type ReportErrorInput,
} from "./appError";
import { queryClient as applicationQueryClient } from "../../lib/queryClient";

type AppErrorContextValue = {
  errors: AppError[];
  reportError: (input: ReportErrorInput) => void;
  dismissError: (id: string) => void;
  dismissAllErrors: () => void;
};

const AppErrorContext = createContext<AppErrorContextValue | null>(null);

const createErrorId = (): string => globalThis.crypto.randomUUID();

export const AppErrorProvider = ({
  children,
  queryClient = applicationQueryClient,
}: {
  children: ReactNode;
  queryClient?: QueryClient;
}) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const reportError = useCallback((input: ReportErrorInput) => {
    const normalized = normalizeError(input.error);
    setErrors((current) => [
      ...current,
      {
        id: createErrorId(),
        title: input.title,
        ...(input.operation == null ? {} : { operation: input.operation }),
        ...normalized,
        occurredAt: new Date(),
      },
    ]);
    showNotification({ message: input.title, color: "red" });
  }, []);

  const dismissError = useCallback((id: string) => {
    setErrors((current) => current.filter((error) => error.id !== id));
  }, []);
  const dismissAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  useEffect(
    () =>
      queryClient.getQueryCache().subscribe((event) => {
        if (event.type === "updated" && event.action.type === "error") {
          reportError({
            title: "データの取得に失敗しました",
            operation: "Query",
            error: event.query.state.error,
          });
        }
      }),
    [queryClient, reportError],
  );

  const value = useMemo(
    () => ({ errors, reportError, dismissError, dismissAllErrors }),
    [errors, reportError, dismissError, dismissAllErrors],
  );

  return (
    <AppErrorContext.Provider value={value}>
      {children}
    </AppErrorContext.Provider>
  );
};

export const useAppError = (): AppErrorContextValue => {
  const context = useContext(AppErrorContext);
  if (context == null) {
    throw new Error("useAppError must be used within AppErrorProvider");
  }
  return context;
};
