import { OnSubmit } from '@mantine/form/lib/types';
import '@testing-library/jest-dom';
import { act, render, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FormEvent } from 'react';
import { Client, Provider } from 'urql';
import { vi } from 'vitest';
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
      executeQuery: vi.fn(() => never),
    };

    // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const hookWrapper: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => (
      <Provider value={mockClient as unknown as Client}>{children}</Provider>
    );
    const wrapper: (
      onSubmit: ReturnType<OnSubmit<IBookForm>>
    ) => React.FC<{ children: React.ReactNode }> =
      (onSubmit) =>
      // eslint-disable-next-line react/display-name, react/prop-types
      ({ children }) =>
        (
          <form onSubmit={onSubmit}>
            {children}
            <button type="submit">送信</button>
          </form>
        );
    const mockSubmit = vi.fn((_book: IBookForm) => {});

    const { result } = renderHook(
      () =>
        useBookForm({
          onSubmit: mockSubmit,
          initialValues: emptyBook,
        }),
      { wrapper: hookWrapper }
    );
    const { getAllByText, getByLabelText, getByRole } = render(
      result.current.form,
      {
        wrapper: wrapper(result.current.submitForm),
      }
    );

    expect(getAllByText('書名')[0]).toBeInTheDocument();
    // TODO: 著者など他のフィールドもテストする
    // const titleInput = getByLabelText('書名') as HTMLInputElement;
    const titleInput = getByRole('textbox', {
      name: '書名',
    });
    const user = userEvent.setup();
    await user.type(titleInput, 'valid title');

    // await userEvent.click(getByRole('button', { name: '送信' }));
    await act(async () => {
      await result.current.submitForm({
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>);
    });

    expect(mockSubmit.mock.calls.length).toBe(1);
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      ...emptyBook,
      title: 'valid title',
    });
  });
});
