import { createFileRoute } from "@tanstack/react-router";
import { AuthorLoader } from "../../features/authors/AuthorLoader";
import { AuthorDetailShow } from "../../features/authors/AuthorDetailShow";

export const Route = createFileRoute("/authors/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AuthorLoader id={id}>
      {(author) => <AuthorDetailShow author={author} />}
    </AuthorLoader>
  );
}
