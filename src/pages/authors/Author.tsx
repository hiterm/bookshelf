import { Button } from '@mui/material';
import { useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField } from '../../features/react-hook-form/mui';
import {
  useAuthorsQuery,
  useCreateAuthorMutation,
} from '../../generated/graphql';

type RegisterAuthorFormInput = {
  name: string;
};

const RegisterAuthorForm: React.FC = () => {
  const [_createAuthorResult, createAuthor] = useCreateAuthorMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterAuthorFormInput>({
    mode: 'all',
    defaultValues: { name: '' },
  });
  const onSubmit: SubmitHandler<RegisterAuthorFormInput> = (data) =>
    createAuthor({ authorData: { name: data.name } });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="名前"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        control={{ control, name: 'name' }}
      />
      <Button variant="contained" onClick={handleSubmit(onSubmit)}>
        登録
      </Button>
    </form>
  );
};

export const AuthorIndexPage: React.FC = () => {
  const context = useMemo(() => ({ additionalTypenames: ['Author'] }), []);
  const [result, reexecuteQuery] = useAuthorsQuery({ context });
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
      <RegisterAuthorForm />
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
