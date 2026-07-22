import type { Author } from "./entity/Author";

export const displayAuthorYomis = (authors: Pick<Author, "yomi">[]): string =>
  authors.map((author) => (author.yomi === "" ? "-" : author.yomi)).join(", ");
