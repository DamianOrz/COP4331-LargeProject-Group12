import { useState, type FormEvent } from 'react';
import { changePassword } from '../../api/authApi';
import AppShell from './AppShell';

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type PasswordErrors = Partial<Record<keyof PasswordValues, string>>;

const weakPasswordMessage = 'Use at least 8 characters with a letter and a number.';
const isWeakPassword = (password: string) => password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password);

function ChangePasswordPage() {
  const [values, setValues] = useState<PasswordValues>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateValue = (field: keyof PasswordValues) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: PasswordErrors = {};

    if (!values.currentPassword) nextErrors.currentPassword = 'Current password is required.';
    if (!values.newPassword) nextErrors.newPassword = 'New password is required.';
    else if (isWeakPassword(values.newPassword)) nextErrors.newPassword = weakPasswordMessage;
    if (values.confirmPassword !== values.newPassword) nextErrors.confirmPassword = 'Passwords must match.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setMessage({ type: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }

    setMessage(null);
    setIsLoading(true);
    try {
      const result = await changePassword(values.currentPassword, values.newPassword);
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: result.message || 'Your password has been changed.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to change password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell title="Change Password" subtitle="Update the password used to access your account.">
      <section className="planner-panel change-password-panel">
        <form className="recipe-form" onSubmit={handleSubmit} noValidate>
          {message && (
            <div className={`planner-message${message.type === 'error' ? ' error' : ''}`} role={message.type === 'error' ? 'alert' : 'status'}>
              {message.text}
            </div>
          )}

          <label htmlFor="current-password">
            <span>Current Password</span>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={values.currentPassword}
              onChange={(event) => updateValue('currentPassword')(event.target.value)}
              aria-invalid={Boolean(errors.currentPassword)}
              disabled={isLoading}
            />
            {errors.currentPassword && <small>{errors.currentPassword}</small>}
          </label>

          <label htmlFor="new-password">
            <span>New Password</span>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={values.newPassword}
              onChange={(event) => updateValue('newPassword')(event.target.value)}
              aria-invalid={Boolean(errors.newPassword)}
              disabled={isLoading}
            />
            {errors.newPassword && <small>{errors.newPassword}</small>}
          </label>

          <label htmlFor="confirm-new-password">
            <span>Confirm New Password</span>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(event) => updateValue('confirmPassword')(event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              disabled={isLoading}
            />
            {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
          </label>

          <div className="form-actions">
            <button className="planner-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Changing password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}

export default ChangePasswordPage;
