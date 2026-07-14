import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';

function makeToken(exp: number): string {
  const encode = (value: object) => window.btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    userId: 'user-1',
    firstName: 'Front',
    lastName: 'Tester',
    email: 'front@example.com',
    exp
  })}.signature`;
}

function SecretPage() {
  return <div>Protected content</div>;
}

function renderProtectedRoute() {
  render(
    <MemoryRouter initialEntries={['/app']}>
      <Switch>
        <ProtectedRoute path="/app" exact component={SecretPage} />
        <Route path="/login" render={({ location }) => <div>Login redirect {location.search}</div>} />
      </Switch>
    </MemoryRouter>
  );
}

describe('protected routes', () => {
  it('redirects logged-out users to login', () => {
    renderProtectedRoute();
    expect(screen.getByText('Login redirect')).toBeVisible();
  });

  it('renders protected content with a valid JWT', () => {
    localStorage.setItem('token_data', makeToken(Math.floor(Date.now() / 1000) + 300));
    renderProtectedRoute();
    expect(screen.getByText('Protected content')).toBeVisible();
  });

  it('clears an expired JWT and adds the session-expired query', () => {
    localStorage.setItem('token_data', makeToken(Math.floor(Date.now() / 1000) - 60));
    renderProtectedRoute();
    expect(screen.getByText('Login redirect ?session=expired')).toBeVisible();
    expect(localStorage.getItem('token_data')).toBeNull();
  });
});
