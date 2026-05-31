import { createFileRoute } from "@tanstack/react-router";
import { AuthorLoader } from "../../features/authors/AuthorLoader";
import { AuthorDetailShow } from "../../features/authors/AuthorDetailShow";
import { AuthorHistory } from "../../features/authors/AuthorHistory";

export const Route = createFileRoute("/authors/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AuthorLoader id={id}>
      {(author) => (
        <>
          <AuthorDetailShow author={author} />
          <AuthorHistory authorId={author.id} />
        </>
      )}
    </AuthorLoader>
  );
}
