import type { BookFormAuthor } from "./bookFormSchema";

export const isPendingAuthor = (author: BookFormAuthor): boolean =>
  author.id.startsWith("__pending__:");

export function bookAuthorInput(authors: BookFormAuthor[]): {
  authorIds: string[];
  newAuthorNames: string[];
} {
  return {
    authorIds: [
      ...new Set(authors.filter((a) => !isPendingAuthor(a)).map((a) => a.id)),
    ],
    newAuthorNames: [
      ...new Set(authors.filter(isPendingAuthor).map((a) => a.name)),
    ],
  };
}

/** Reconcile only submitted selections that the user has not edited or removed. */
export function reconcileAuthors(
  current: BookFormAuthor[],
  submitted: BookFormAuthor[],
  existing: BookFormAuthor[],
): { authors: BookFormAuthor[]; names: string[] } {
  const names: string[] = [];
  const seen = new Set<string>();
  const byName = new Map(existing.map((author) => [author.name, author]));
  const authors = current
    .map((author) => {
      if (
        !isPendingAuthor(author) ||
        !submitted.some(
          (item) => item.id === author.id && item.name === author.name,
        )
      )
        return author;
      const match = byName.get(author.name);
      if (match == null) return author;
      names.push(author.name);
      return { id: match.id, name: match.name };
    })
    .filter((author) => {
      if (seen.has(author.id)) return false;
      seen.add(author.id);
      return true;
    });
  return { authors, names: [...new Set(names)] };
}
