import { ReadableStream, TransformStream, WritableStream } from "node:stream/web";
import "@testing-library/jest-dom/vitest";

Object.defineProperties(globalThis, {
  ReadableStream: { configurable: true, value: ReadableStream },
  TransformStream: { configurable: true, value: TransformStream },
  WritableStream: { configurable: true, value: WritableStream },
});
