import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuestionById, getSubmissions as fetchSubmissionsApi } from '../api/questions';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getQuestionById(id);
      setQuestion(response.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to view this question');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch question');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionsData = async () => {
    setSubmissionsLoading(true);
    try {
      const response = await fetchSubmissionsApi(id);
      setSubmissions(response.data.data);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleShowSubmissions = () => {
    if (!showSubmissions && submissions.length === 0) {
      fetchSubmissionsData();
    }
    setShowSubmissions(!showSubmissions);
  };

  if (loading) {
    return (
      <div className="bg-app-bg flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-2 text-app-muted">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-app-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-app-panel rounded-lg shadow p-8">
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link
            to="/questions"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/questions"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Questions
        </Link>

        <div className="bg-app-panel rounded-lg shadow p-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-app-text">{question.title}</h1>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-900/30 text-blue-400">
              {question.layer}
            </span>
          </div>

          <div className="flex items-center space-x-4 mb-6 text-sm text-app-muted">
            <span className="px-3 py-1 bg-app-hover rounded-full">Difficulty: {question.difficulty}</span>
            <span>Created: {new Date(question.createdAt).toLocaleDateString('en-IN')}</span>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-app-text mb-3">Reproduction Steps</h2>
            <p className="text-app-muted whitespace-pre-wrap">{question.reproSteps}</p>
          </div>

          {question.repoDescription && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-app-text mb-3">Repository Description</h2>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-app-muted whitespace-pre-wrap">{question.repoDescription}</p>
              </div>
            </div>
          )}

          {question.hints && question.hints.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center space-x-2 text-lg font-semibold text-app-text mb-3 hover:text-blue-400 transition-colors"
              >
                <span>Hints</span>
                <svg
                  className={`w-5 h-5 transition-transform ${showHints ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showHints && (
                <div className="space-y-2">
                  {question.hints.map((hint, index) => (
                    <div key={index} className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-sm text-app-muted">
                        <span className="font-medium text-yellow-400">Hint {index + 1}:</span> {hint}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleShowSubmissions}
              className="flex items-center space-x-2 text-lg font-semibold text-app-text mb-3 hover:text-blue-400 transition-colors"
            >
              <span>Submissions</span>
              <svg
                className={`w-5 h-5 transition-transform ${showSubmissions ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSubmissions && (
              <div className="mt-3">
                {submissionsLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                    <p className="mt-2 text-sm text-app-muted">Loading submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="bg-app-hover border border-app-border rounded-lg p-4 text-center">
                    <p className="text-sm text-app-muted">No submissions yet</p>
                  </div>
                ) : (
                  <div className="bg-app-panel border border-app-border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-app-border">
                      <thead className="bg-app-hover">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">Attempt #</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">Output</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-app-panel divide-y divide-app-border">
                        {submissions.map((submission, index) => (
                          <tr key={submission._id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-app-text">
                              #{submissions.length - index}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {submission.passed ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400">
                                  Passed
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-900/30 text-red-400">
                                  Failed
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-app-muted">
                              {new Date(submission.attemptedAt).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-sm text-app-muted max-w-xs truncate">
                              {submission.output || 'No output'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <Link
                                to={`/questions/${id}/submissions/${submission._id}`}
                                className="text-blue-400 hover:text-blue-300 font-medium"
                              >
                                View Submission
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-app-border">
            <button
              onClick={() => navigate(`/questions/${id}/workspace`)}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold text-lg transition-colors"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
