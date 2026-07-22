type AuthorWithYomi = {
  yomi: string;
};

export const displayAuthorYomis = (authors: AuthorWithYomi[]): string =>
  authors.map((author) => (author.yomi.length ? author.yomi : "-")).join(", ");
