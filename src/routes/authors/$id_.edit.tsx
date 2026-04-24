import { createFileRoute } from "@tanstack/react-router";
import { AuthorLoader } from "../../features/authors/AuthorLoader";
import { AuthorDetailEdit } from "../../features/authors/AuthorDetailEdit";

export const Route = createFileRoute("/authors/$id_/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AuthorLoader id={id}>
      {(author) => <AuthorDetailEdit author={author} />}
    </AuthorLoader>
  );
}
