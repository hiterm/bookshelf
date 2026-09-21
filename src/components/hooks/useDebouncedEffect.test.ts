import { renderHook } from "@testing-library/react";
import { useDebouncedEffect } from "./useDebouncedEffect";

describe("useDebouncedEffect", () => {
  beforeEach(() => {
    rs.useFakeTimers();
  });

  afterEach(() => {
    rs.useRealTimers();
  });

  test("does not call effect before delay elapses", () => {
    const effect = rs.fn();
    renderHook(() => {
      useDebouncedEffect(effect, [], 500);
    });

    rs.advanceTimersByTime(499);
    expect(effect).not.toHaveBeenCalled();
  });

  test("calls effect once after delay elapses", () => {
    const effect = rs.fn();
    renderHook(() => {
      useDebouncedEffect(effect, [], 500);
    });

    rs.advanceTimersByTime(500);
    expect(effect).toHaveBeenCalledTimes(1);
  });

  test("resets timer when deps change, calling effect only once", () => {
    const effect = rs.fn();
    let dep = 0;
    const { rerender } = renderHook(() => {
      useDebouncedEffect(effect, [dep], 500);
    });

    rs.advanceTimersByTime(300);
    dep = 1;
    rerender();

    rs.advanceTimersByTime(300);
    expect(effect).not.toHaveBeenCalled();

    rs.advanceTimersByTime(200);
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
