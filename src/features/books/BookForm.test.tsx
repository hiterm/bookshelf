import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const App: React.VFC = () => {
  return <h1>Hello, World!</h1>;
};

test('renders a message', () => {
  const { container, getByText } = render(<App />);
  expect(getByText('Hello, World!')).toBeInTheDocument();
});
