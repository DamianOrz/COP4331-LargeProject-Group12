import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ChangePasswordPage from '../pages/mealplanner/ChangePasswordPage';

describe('change password form', () => {
  it('shows required field validation and password mismatch feedback', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Change Password' }));
    expect(screen.getByText('Current password is required.')).toBeVisible();
    expect(screen.getByText('New password is required.')).toBeVisible();

    await user.type(screen.getByLabelText(/^Current Password/), 'Password123');
    await user.type(screen.getByLabelText(/^New Password/), 'Password456');
    await user.type(screen.getByLabelText(/^Confirm New Password/), 'Password789');
    await user.click(screen.getByRole('button', { name: 'Change Password' }));
    expect(screen.getByText('Passwords must match.')).toBeVisible();
  });
});
