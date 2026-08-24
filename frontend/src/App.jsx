import { useEffect } from 'react';
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

function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await refreshApi();
        dispatch(loginSuccess({ id: response.data.data?.id || null }));
      } catch (err) {
        console.log('Session verification failed:', err.response?.status);
      } finally {
        dispatch(setInitialized());
      }
    };

    verifySession();
  }, [dispatch]);

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
    </div>
  );
}

export default App
