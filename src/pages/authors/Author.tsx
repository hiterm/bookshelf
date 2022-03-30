import {
  useAuthorsQuery,
  useCreateAuthorMutation,
} from '../../generated/graphql';

export const AuthorIndexPage: React.FC = () => {
  const [result, reexecuteQuery] = useAuthorsQuery();
  const { data, fetching, error } = result;

  const [_createAuthorResult, createAuthor] = useCreateAuthorMutation();
  const handleCreateAuthor = () => {
    createAuthor({
      authorData: { name: Math.random().toString(32).substring(2) },
    });
  };

  if (error != null) {
    return <>{JSON.stringify(error)}</>;
  }

  if (fetching || data == null) {
    return <>loading</>;
  }

  return (
    <>
      <button onClick={handleCreateAuthor}>create</button>
      <button onClick={() => reexecuteQuery()}>update</button>
      <ul>
        {data.authors.map((author) => (
          <li key={author.id}>name: {author.name}</li>
        ))}
      </ul>
    </>
  );
};
