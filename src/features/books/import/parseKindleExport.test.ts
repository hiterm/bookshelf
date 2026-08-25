import { describe, expect, test } from "vitest";
import { KindleExportParseError, parseKindleExport } from "./parseKindleExport";

const exporterFixture = [
  {
    title: "テスト技術書",
    authors: "山田 太郎",
    acquiredTime: 1_777_075_200_000,
    readStatus: "READ",
    asin: "B0TEST00001",
    productImage: "https://example.com/book-1.jpg",
  },
  {
    title: "テスト小説",
    authors: "鈴木 花子, 佐藤 次郎",
    acquiredTime: 1_777_161_600_000,
    readStatus: "UNKNOWN",
    asin: "B0TEST00002",
  },
];

describe("parseKindleExport", () => {
  test("normalizes multiple books from actual exporter-shaped JSON", () => {
    const result = parseKindleExport(JSON.stringify(exporterFixture));

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      title: "テスト技術書",
      authorText: "山田 太郎",
      purchasedAt: new Date(1_777_075_200_000),
      read: true,
      asin: "B0TEST00001",
      imageUrl: "https://example.com/book-1.jpg",
    });
    expect(result[1]).toMatchObject({
      title: "テスト小説",
      authorText: "鈴木 花子, 佐藤 次郎",
      purchasedAt: new Date(1_777_161_600_000),
      read: false,
      asin: "B0TEST00002",
    });
  });

  test("accepts unknown fields added by the exporter", () => {
    const result = parseKindleExport(
      JSON.stringify([{ ...exporterFixture[0], futureField: "allowed" }]),
    );

    expect(result).toHaveLength(1);
  });

  test("accepts an explicitly missing product image", () => {
    const result = parseKindleExport(
      JSON.stringify([{ ...exporterFixture[0], productImage: null }]),
    );

    expect(result[0]?.imageUrl).toBeUndefined();
  });

  test("rejects invalid JSON", () => {
    expect(() => parseKindleExport("not JSON")).toThrow(KindleExportParseError);
  });

  test("rejects a missing required field", () => {
    const { title: _title, ...missingTitle } = exporterFixture[0];

    expect(() => parseKindleExport(JSON.stringify([missingTitle]))).toThrow(
      /Kindle Bookshelf Exporter/,
    );
  });

  test("rejects an invalid purchase date", () => {
    expect(() =>
      parseKindleExport(
        JSON.stringify([
          { ...exporterFixture[0], acquiredTime: Number.MAX_SAFE_INTEGER },
        ]),
      ),
    ).toThrow(/購入日/);
  });

  test("rejects unsupported read status", () => {
    expect(() =>
      parseKindleExport(
        JSON.stringify([{ ...exporterFixture[0], readStatus: "UNREAD" }]),
      ),
    ).toThrow(/Kindle Bookshelf Exporter/);
  });

  test.each(["   ", ",", " , "])(
    "rejects author text that cannot produce an author name: %j",
    (authors) => {
      expect(() =>
        parseKindleExport(JSON.stringify([{ ...exporterFixture[0], authors }])),
      ).toThrow(/Kindle Bookshelf Exporter/);
    },
  );
});
