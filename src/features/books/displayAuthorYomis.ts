type AuthorWithYomi = {
  yomi?: string | null;
};

export const displayAuthorYomis = (authors: AuthorWithYomi[]): string =>
  authors.map((author) => (author.yomi?.length ? author.yomi : "-")).join(", ");
