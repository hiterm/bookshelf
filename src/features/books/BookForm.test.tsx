import '@testing-library/jest-dom';
import { useBookForm } from './BookForm';
import { renderHook } from '@testing-library/react-hooks';
import { BookBaseType } from './schema';
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
    const emptyBook: BookBaseType = {
      title: '',
      authors: [''],
      read: false,
      owned: false,
      priority: 50,
    };

    const { result } = renderHook(() =>
      useBookForm({
        onSubmit: () => {},
        initialValues: emptyBook,
      })
    );
    const { container, getByText, getAllByText, getByLabelText } = render(
      result.current.renderForm()
    );
    expect(getAllByText('書名')[0]).toBeInTheDocument();
    const nameInput = getByLabelText('書名');
    const authorInput = getByLabelText('著者1');
    await waitFor(() => {
      userEvent.type(nameInput, 'valid name');
      userEvent.type(authorInput, 'valid author');
      result.current.submitForm();
    });
  });
});
