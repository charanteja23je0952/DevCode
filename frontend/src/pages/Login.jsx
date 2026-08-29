import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginApi, guest as guestApi } from '../api/auth';
import { loginStart, loginSuccess, loginFailure, setInitialized } from '../store/authSlice';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [guestLoading, setGuestLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await loginApi(formData);
      dispatch(loginSuccess({ id: response.data.data.id }));
      dispatch(setInitialized());
      navigate('/questions');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed. Please try again.'));
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);

    try {
      const response = await guestApi();
      dispatch(loginSuccess({ id: response.data.data.id }));
      dispatch(setInitialized());
      navigate('/questions');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Guest login failed. Please try again.'));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="bg-app-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full ui-panel p-8">
        <h1 className="text-3xl font-bold text-app-text mb-6">Login</h1>
        
        {error && (
          <div className="ui-alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="ui-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="ui-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="ui-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="ui-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ui-button ui-button-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading || guestLoading}
            className="ui-button ui-button-secondary w-full"
          >
            {guestLoading ? 'Creating guest session...' : 'Continue as Guest'}
          </button>
        </div>

        <p className="mt-4 text-center text-app-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
