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
      <div className="bg-app-bg flex items-center justify-center py-12 min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-app-border border-t-app-accent" />
          <p className="mt-2 ui-meta">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-app-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full ui-panel p-8">
          <div className="ui-alert-error mb-4">{error}</div>
          <Link to="/questions" className="ui-button-primary inline-block">
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="bg-app-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/questions"
          className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Questions
        </Link>

        <div className="ui-panel p-8">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <h1 className="text-3xl font-bold text-app-text">{question.title}</h1>
            <span className="ui-badge bg-app-accent-soft text-indigo-300">{question.layer}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6 ui-meta">
            <span className="ui-badge bg-app-hover text-app-text">Difficulty: {question.difficulty}</span>
            <span>Created: {new Date(question.createdAt).toLocaleDateString('en-IN')}</span>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-app-text mb-3">Reproduction Steps</h2>
            <p className="text-app-muted whitespace-pre-wrap leading-7">{question.reproSteps}</p>
          </div>

          {question.repoDescription && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-app-text mb-3">Repository Description</h2>
              <div className="ui-alert-info">
                <p className="text-app-muted whitespace-pre-wrap">{question.repoDescription}</p>
              </div>
            </div>
          )}

          {question.hints && question.hints.length > 0 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 text-lg font-semibold text-app-text mb-3 hover:text-indigo-300 transition-colors"
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
                    <div key={index} className="ui-alert-warning">
                      <p className="text-sm text-app-muted">
                        <span className="font-medium text-app-warning">Hint {index + 1}:</span> {hint}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleShowSubmissions}
              className="flex items-center gap-2 text-lg font-semibold text-app-text mb-3 hover:text-indigo-300 transition-colors"
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
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-app-border border-t-app-accent" />
                    <p className="mt-2 text-sm ui-meta">Loading submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="ui-panel p-4 text-center">
                    <p className="text-sm ui-meta">No submissions yet</p>
                  </div>
                ) : (
                  <div className="ui-panel overflow-hidden">
                    <div className="overflow-x-auto">
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
                        <tbody className="divide-y divide-app-border">
                          {submissions.map((submission, index) => (
                            <tr key={submission._id} className="hover:bg-app-hover/50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-app-text">#{submissions.length - index}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {submission.passed ? (
                                  <span className="ui-badge-success">Passed</span>
                                ) : (
                                  <span className="ui-badge-error">Failed</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm ui-meta">
                                {new Date(submission.attemptedAt).toLocaleString('en-IN')}
                              </td>
                              <td className="px-4 py-3 text-sm ui-meta max-w-xs truncate">{submission.output || 'No output'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <Link
                                  to={`/questions/${id}/submissions/${submission._id}`}
                                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                >
                                  View Submission
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-app-border">
            <button
              type="button"
              onClick={() => navigate(`/questions/${id}/workspace`)}
              className="ui-button-primary w-full text-lg py-3 bg-app-success hover:bg-green-600"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
