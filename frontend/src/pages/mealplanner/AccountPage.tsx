import { Link, useHistory } from 'react-router-dom';
import { clearSession, getSessionState } from '../../authSession';
import AppShell from './AppShell';

function AccountPage() {
  const history = useHistory();
  const { user } = getSessionState();

  const handleLogout = () => {
    clearSession();
    history.push('/login');
  };

  return (
    <AppShell title="Account" subtitle="View your basic account information.">
      <section className="planner-panel account-panel" aria-label="Account details">
        <label>
          <span>First Name</span>
          <input value={user?.firstName ?? ''} readOnly />
        </label>

        <label>
          <span>Last Name</span>
          <input value={user?.lastName ?? ''} readOnly />
        </label>

        <label>
          <span>Email</span>
          <input type="email" value={user?.email ?? ''} readOnly />
        </label>

        <div className="form-actions">
          <button className="planner-button" type="button" onClick={handleLogout}>Logout</button>
          <Link className="secondary-link" to="/reset-password">Change Password</Link>
        </div>
      </section>
    </AppShell>
  );
}

export default AccountPage;
