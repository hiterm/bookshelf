import { renderHook } from "@testing-library/react";
import { useDebouncedEffect } from "./useDebouncedEffect";

describe("useDebouncedEffect", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("does not call effect before delay elapses", () => {
    const effect = vi.fn();
    renderHook(() => {
      useDebouncedEffect(effect, [], 500);
    });

    vi.advanceTimersByTime(499);
    expect(effect).not.toHaveBeenCalled();
  });

  test("calls effect once after delay elapses", () => {
    const effect = vi.fn();
    renderHook(() => {
      useDebouncedEffect(effect, [], 500);
    });

    vi.advanceTimersByTime(500);
    expect(effect).toHaveBeenCalledTimes(1);
  });

  test("resets timer when deps change, calling effect only once", () => {
    const effect = vi.fn();
    let dep = 0;
    const { rerender } = renderHook(() => {
      useDebouncedEffect(effect, [dep], 500);
    });

    vi.advanceTimersByTime(300);
    dep = 1;
    rerender();

    vi.advanceTimersByTime(300);
    expect(effect).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
