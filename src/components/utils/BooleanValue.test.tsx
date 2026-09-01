import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { BooleanValue } from "./BooleanValue";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("BooleanValue", () => {
  it.each([true, false])(
    "renders the %s value with an inline root inside a paragraph",
    (flag) => {
      render(
        <MantineProvider env="test">
          <p data-testid="paragraph">
            <BooleanValue flag={flag} />
          </p>
        </MantineProvider>,
      );

      expect(screen.getByTestId("paragraph").firstElementChild).toHaveProperty(
        "tagName",
        "SPAN",
      );
    },
  );
});
