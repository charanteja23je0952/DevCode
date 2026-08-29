import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutApi } from '../api/auth';
import { logout, setInitialized } from '../store/authSlice';

export default function Header() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      dispatch(setInitialized());
      navigate('/login');
    }
  };

  const questionsActive =
    location.pathname === '/questions' || location.pathname.startsWith('/questions/');

  return (
    <header className="bg-app-panel border-b border-app-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-16 py-2 gap-4">
          <Link to="/" className="text-2xl font-bold text-app-text hover:text-indigo-300 transition-colors">
            DevCode
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
            <Link
              to="/questions"
              className={questionsActive ? 'ui-tab-active' : 'ui-tab'}
            >
              Questions
            </Link>

            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className="ui-button-secondary text-sm">
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={isActive('/login') ? 'ui-tab-active' : 'ui-tab'}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={isActive('/signup') ? 'ui-tab-active' : 'ui-tab'}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
