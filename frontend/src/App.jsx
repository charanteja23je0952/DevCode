import { useEffect, useState } from 'react';
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

function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);
  const [showConnecting, setShowConnecting] = useState(true);
  
  const [showStartupModal, setShowStartupModal] = useState(() => {
    return !localStorage.getItem('devcode-startup-notice-seen');
  });

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await refreshApi();
        dispatch(loginSuccess({ id: response.data.data?.id || null }));
      } catch (err) {
        console.log('Session verification failed:', err.response?.status);
      } finally {
        dispatch(setInitialized());
        setShowConnecting(false);
      }
    };

    verifySession();
  }, [dispatch]);

  const dismissStartupModal = () => {
    setShowStartupModal(false);
    localStorage.setItem('devcode-startup-notice-seen', 'true');
  };

  return (
    <div className="flex flex-col min-h-screen">
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
          <div className="bg-app-panel rounded-xl shadow-lg p-8 max-w-md mx-4 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-app-text">Welcome to DevCode</h2>
              <button
                onClick={dismissStartupModal}
                className="text-app-muted hover:text-app-text text-2xl leading-none"
              >
                {EMOJIS.CLOSE}
              </button>
            </div>
            <p className="text-app-text mb-6">
              DevCode is waking up<br/>
              The backend may take a little time to wake up after being idle. Thanks for your patience!
            </p>
            <button
              onClick={dismissStartupModal}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showConnecting && !showStartupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-app-panel rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-app-text text-lg">Connecting to DevCode...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;