import '@testing-library/jest-dom';
import { useBookForm } from './BookForm';
import { renderHook } from '@testing-library/react-hooks';
import { BookBaseType, GraphQLBookBase } from './schema';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const App: React.VFC = () => {
  return <h1>Hello, World!</h1>;
};

test('renders a message', () => {
  const { container, getByText } = render(<App />);
  expect(getByText('Hello, World!')).toBeInTheDocument();
});

describe('useBookForm', () => {
  test('works', async () => {
    const emptyBook: GraphQLBookBase = {
      title: '',
      authors: [],
      isbn: '',
      read: false,
      owned: false,
      priority: 50,
      format: 'UNKNOWN',
      store: 'UNKNOWN',
    };

    const mockSubmit = jest.fn((_book: GraphQLBookBase) => {});
    const { result } = renderHook(() =>
      useBookForm({
        onSubmit: mockSubmit,
        initialValues: emptyBook,
      })
    );
    const { container, getByText, getAllByText, getByLabelText } = render(
      result.current.renderForm()
    );
    expect(getAllByText('書名')[0]).toBeInTheDocument();
    const titleInput = getByLabelText('書名') as HTMLInputElement;
    const authorInput = getByLabelText('著者1');
    userEvent.type(titleInput, 'valid title');
    userEvent.type(authorInput, 'valid author');
    await waitFor(async () => {
      result.current.submitForm();
    });

    expect(mockSubmit.mock.calls.length).toBe(1);
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      authors: ['valid author'],
      owned: false,
      priority: 50,
      read: false,
      title: 'valid title',
    });
  });
});
