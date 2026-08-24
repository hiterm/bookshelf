import { createFileRoute } from "@tanstack/react-router";
import { AuthorLoader } from "../../features/authors/AuthorLoader";
import { AuthorDetail } from "../../features/authors/AuthorDetail";
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
          <AuthorDetail author={author} />
          <AuthorHistory authorId={author.id} />
        </>
      )}
    </AuthorLoader>
  );
}
