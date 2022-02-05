import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useBookForm } from './BookForm';
import { renderHook } from '@testing-library/react-hooks';
import { BookBaseType } from './schema';

const App: React.VFC = () => {
  return <h1>Hello, World!</h1>;
};

test('renders a message', () => {
  const { container, getByText } = render(<App />);
  expect(getByText('Hello, World!')).toBeInTheDocument();
});

describe('useBookForm', () => {
  test('works', () => {
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
    const { container, getByText, getAllByText } = render(result.current.renderForm());
    expect( getAllByText('書名')[0]).toBeInTheDocument();
  });
});
