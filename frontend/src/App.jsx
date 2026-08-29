import { useEffect, useState, useCallback, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import QuestionList from './pages/QuestionList';
import QuestionDetail from './pages/QuestionDetail';
import Workspace from './pages/Workspace';
import SubmissionView from './pages/SubmissionView';
import { refresh as refreshApi } from './api/auth';
import { loginSuccess, setInitialized } from './store/authSlice';
import { EMOJIS } from './constants/emojis';

const SLOW_CONNECTION_THRESHOLD_MS = 8000;

function App() {
  const dispatch = useDispatch();

  const [connectionState, setConnectionState] = useState('connecting');
  const slowTimerRef = useRef(null);

  const [showStartupModal, setShowStartupModal] = useState(() => {
    return !localStorage.getItem('devcode-startup-notice-seen');
  });

  const verifySession = useCallback(async () => {
    setConnectionState('connecting');

    slowTimerRef.current = setTimeout(() => {
      setConnectionState('slow');
    }, SLOW_CONNECTION_THRESHOLD_MS);

    try {
      const response = await refreshApi();
      dispatch(loginSuccess({ id: response.data.data?.id || null }));
    } catch (err) {
      console.log('Session verification failed:', err.response?.status);
    } finally {
      clearTimeout(slowTimerRef.current);
      dispatch(setInitialized());
      setConnectionState('done');
    }
  }, [dispatch]);

  useEffect(() => {
    verifySession();
    return () => clearTimeout(slowTimerRef.current);
  }, [verifySession]);

  const dismissStartupModal = () => {
    setShowStartupModal(false);
    localStorage.setItem('devcode-startup-notice-seen', 'true');
  };

  const showConnectingOverlay = connectionState !== 'done';

  return (
    <div className="flex flex-col min-h-screen bg-app-bg text-app-text">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <QuestionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/:id"
            element={
              <ProtectedRoute>
                <QuestionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/:id/workspace"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/:id/submissions/:submissionId"
            element={
              <ProtectedRoute>
                <SubmissionView />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/questions" replace />} />
        </Routes>
      </main>
      <Footer />

      {showStartupModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="ui-panel p-8 max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-app-text">Welcome to DevCode</h2>
              <button
                onClick={dismissStartupModal}
                className="text-app-muted hover:text-app-text text-2xl leading-none"
                aria-label="Close"
              >
                {EMOJIS.CLOSE}
              </button>
            </div>
            <p className="text-app-text mb-6">
              DevCode is waking up.<br />
              The backend may take up to a minute to respond after being idle. Thanks for your patience!
            </p>
            <button onClick={dismissStartupModal} className="ui-button-primary w-full">
              Got it
            </button>
          </div>
        </div>
      )}

      {showConnectingOverlay && !showStartupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="ui-panel p-8 text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-accent mx-auto mb-4" />
            <p className="text-app-text text-lg font-medium">
              {connectionState === 'slow' ? 'Still waking up the server…' : 'Connecting to DevCode...'}
            </p>
            {connectionState === 'slow' && (
              <p className="text-app-muted text-sm mt-2">
                First load after inactivity can take up to a minute. Hang tight.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;