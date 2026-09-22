import {
  ReadableStream,
  TransformStream,
  WritableStream,
} from "node:stream/web";
import * as jestDomMatchers from "@testing-library/jest-dom/matchers";
import { expect } from "@rstest/core";

expect.extend(jestDomMatchers);

Object.defineProperties(globalThis, {
  ReadableStream: { configurable: true, value: ReadableStream },
  TransformStream: { configurable: true, value: TransformStream },
  WritableStream: { configurable: true, value: WritableStream },
});
