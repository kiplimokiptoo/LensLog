import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('./router', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h2>Welcome to LensLog</h2>
    </div>
  ),
}));

import App from './App';

test('renders the welcome heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /welcome to lenslog/i })).toBeInTheDocument();
});
