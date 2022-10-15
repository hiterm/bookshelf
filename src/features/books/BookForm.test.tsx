import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import { Client, Provider } from 'urql';
import { never } from 'wonka';
import { useBookForm } from './BookForm';
import { IBookForm } from './schema';

describe('useBookForm', () => {
  test('works', async () => {
    const emptyBook: IBookForm = {
      title: '',
      authors: [
        { id: 'c156c887-e162-4777-85c9-ec474a666a87', name: 'author1' },
      ],
      isbn: '',
      read: false,
      owned: false,
      priority: 50,
      format: 'UNKNOWN',
      store: 'UNKNOWN',
    };

    const mockClient = {
      executeQuery: jest.fn(() => never),
    };

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider value={mockClient as unknown as Client}>{children}</Provider>
    );
    const mockSubmit = jest.fn((_book: IBookForm) => {});

    const { result } = renderHook(
      () =>
        useBookForm({
          onSubmit: mockSubmit,
          initialValues: emptyBook,
        }),
      { wrapper }
    );
    const { getAllByText, getByLabelText } = render(result.current.form);

    expect(getAllByText('書名')[0]).toBeInTheDocument();
    // TODO: 著者など他のフィールドもテストする
    const titleInput = getByLabelText('書名') as HTMLInputElement;
    userEvent.type(titleInput, 'valid title');

    await waitFor(async () => {
      result.current.submitForm();
    });

    expect(mockSubmit.mock.calls.length).toBe(1);
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      ...emptyBook,
      title: 'valid title',
    });
  });
});
