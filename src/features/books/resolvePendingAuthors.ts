import type { Author } from "./entity/Author";

export const resolvePendingAuthors = async (
  authors: Author[],
  createAuthor: (name: string) => Promise<string>,
): Promise<Author[]> => {
  return Promise.all(
    authors.map(async (author) => {
      if (author.id.startsWith("__pending__:")) {
        const id = await createAuthor(author.name);
        return { id, name: author.name };
      }
      return author;
    }),
  );
};
