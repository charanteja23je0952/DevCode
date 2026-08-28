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
    dispatch(loginStart());

    try {
      const response = await guestApi();
      dispatch(loginSuccess({ id: response.data.data.id }));
      dispatch(setInitialized());
      navigate('/questions');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Guest login failed. Please try again.'));
    }
  };

  return (
    <div className="bg-app-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-app-panel rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-app-text mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-app-text mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-app-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-app-editor text-app-text"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-app-text mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-app-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-app-editor text-app-text"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating guest session...' : 'Continue as Guest'}
          </button>
        </div>

        <p className="mt-4 text-center text-app-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
