import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../appPages.css';

interface AppShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/app' },
  { label: 'Recipes', path: '/app/recipes' },
  { label: 'Weekly Planner', path: '/app/planner' },
  { label: 'Account', path: '/app/account' }
];

function AppShell({ title, subtitle, action, children }: AppShellProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="planner-app-shell">
      <header className="planner-topbar">
        <Link className="planner-brand" to="/app" aria-label="Meal Planner dashboard">
          <span className="planner-brand-mark">MP</span>
          <span>Meal Planner</span>
        </Link>
        <nav className="planner-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link className={isActive(item.path) ? 'active' : ''} key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="planner-main">
        <div className="planner-page-heading">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action && <div className="planner-heading-action">{action}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}

export default AppShell;
