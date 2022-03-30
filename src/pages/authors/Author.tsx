import {
  useAuthorsQuery,
  useCreateAuthorMutation,
  useRegisterUserMutation,
} from '../../generated/graphql';

export const AuthorIndexPage: React.FC = () => {
  const [authors] = useAuthorsQuery();

  const [registerUserResult, registerUser] = useRegisterUserMutation();
  const handleRegisterUser = () => {
    registerUser();
  };

  const [createAuthorResult, createAuthor] = useCreateAuthorMutation();
  const handleCreateAuthor = () => {
    createAuthor({
      authorData: { name: Math.random().toString(32).substring(2) },
    });
  };

  return (
    <>
      <ul>
        {authors.data!.authors.map((author) => (
          <li key={author.id}>name: {author.name}</li>
        ))}
      </ul>
    </>
  );
};
