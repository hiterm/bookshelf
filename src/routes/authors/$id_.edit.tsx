import { createFileRoute } from "@tanstack/react-router";
import { AuthorLoader } from "../../features/authors/AuthorLoader";
import { AuthorEdit } from "../../features/authors/AuthorEdit";

export const Route = createFileRoute("/authors/$id_/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <AuthorLoader id={id}>
      {(author) => <AuthorEdit author={author} />}
    </AuthorLoader>
  );
}
