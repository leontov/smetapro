import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import TabBar from './TabBar';

describe('TabBar', () => {
  it('renders navigation tabs', () => {
    render(
      <MemoryRouter>
        <TabBar />
      </MemoryRouter>
    );

    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Проекты')).toBeInTheDocument();
    expect(screen.getByText('Настройки')).toBeInTheDocument();
  });
});
