import {
  useAuthorsQuery,
  useCreateAuthorMutation,
} from '../../generated/graphql';

export const AuthorIndexPage: React.FC = () => {
  const [result] = useAuthorsQuery();
  const { data, fetching, error } = result;

  const [_createAuthorResult, createAuthor] = useCreateAuthorMutation();
  const handleCreateAuthor = () => {
    createAuthor({
      authorData: { name: Math.random().toString(32).substring(2) },
    });
  };

  if (fetching || data == null) {
    return <>loading</>;
  }

  return (
    <>
      <button onClick={handleCreateAuthor}>create</button>
      <ul>
        {data.authors.map((author) => (
          <li key={author.id}>name: {author.name}</li>
        ))}
      </ul>
    </>
  );
};
