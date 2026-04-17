import type { Author } from "./entity/Author";

export const resolvePendingAuthors = async (
  authors: Author[],
  createAuthor: (name: string) => Promise<string>,
): Promise<Author[]> => {
  const pendingNames = new Set(
    authors.filter((a) => a.id.startsWith("__pending__:")).map((a) => a.name),
  );

  const nameToId = new Map<string, string>();
  await Promise.all(
    Array.from(pendingNames).map(async (name) => {
      const id = await createAuthor(name);
      nameToId.set(name, id);
    }),
  );

  return authors.map((author) => {
    if (author.id.startsWith("__pending__:")) {
      const id = nameToId.get(author.name);
      return { id: id ?? author.id, name: author.name };
    }
    return author;
  });
};
