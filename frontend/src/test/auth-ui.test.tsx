import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import MealPlannerAuthApp from '../AuthApp';

describe('auth form validation', () => {
  it('shows every required registration error', async () => {
    window.history.replaceState({}, '', '/register');
    const user = userEvent.setup();
    render(<MealPlannerAuthApp />);

    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('First name is required.')).toBeVisible();
    expect(screen.getByText('Last name is required.')).toBeVisible();
    expect(screen.getByText('Email is required.')).toBeVisible();
    expect(screen.getByText('Password is required.')).toBeVisible();
    expect(screen.getByText('You must agree to the terms.')).toBeVisible();
  });

  it('rejects mismatched registration passwords', async () => {
    window.history.replaceState({}, '', '/register');
    const user = userEvent.setup();
    render(<MealPlannerAuthApp />);

    await user.type(screen.getByLabelText('First Name'), 'Front');
    await user.type(screen.getByLabelText('Last Name'), 'Tester');
    await user.type(screen.getByLabelText('Email'), 'front@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'Password456');
    await user.click(screen.getByLabelText(/I agree to the/));
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Passwords must match.')).toBeVisible();
  });

  it('shows required login errors', async () => {
    window.history.replaceState({}, '', '/login');
    const user = userEvent.setup();
    render(<MealPlannerAuthApp />);

    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(screen.getByText('Email is required.')).toBeVisible();
    expect(screen.getByText('Password is required.')).toBeVisible();
  });

  it('shows the registered email on the check-email page', () => {
    window.history.replaceState({}, '', '/check-email?email=front@example.com');
    render(<MealPlannerAuthApp />);

    expect(screen.getByText('front@example.com')).toBeVisible();
    expect(screen.queryByText('your.email@example.com')).not.toBeInTheDocument();
  });
});
