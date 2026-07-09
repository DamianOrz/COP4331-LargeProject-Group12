import type { ComponentType } from 'react';
import { Redirect, Route } from 'react-router-dom';
import type { RouteProps } from 'react-router-dom';
import { getSessionState } from './authSession';

interface ProtectedRouteProps extends RouteProps {
  component: ComponentType;
}

function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  return (
    <Route
      {...rest}
      render={() => {
        const session = getSessionState();
        if (!session.isAuthenticated) {
          return <Redirect to={session.isExpired ? '/login?session=expired' : '/login'} />;
        }

        return <Component />;
      }}
    />
  );
}

export default ProtectedRoute;
