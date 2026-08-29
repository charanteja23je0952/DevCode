import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getQuestions } from '../api/questions';

export default function QuestionList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const layerFilter = searchParams.get('layer') || 'all';

  useEffect(() => {
    fetchQuestions();
  }, [layerFilter]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = layerFilter !== 'all' ? { layer: layerFilter } : {};
      const response = await getQuestions(params);
      setQuestions(response.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to view questions');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch questions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (layer) => {
    const nextParams = new URLSearchParams(searchParams);
    if (layer === 'all') {
      nextParams.delete('layer');
    } else {
      nextParams.set('layer', layer);
    }
    setSearchParams(nextParams);
  };

  const layers = ['all', 'backend', 'frontend', 'fullstack'];

  return (
    <div className="bg-app-bg py-8 px-4 min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-app-text">Questions</h1>
        </div>

        <div className="ui-panel p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {layers.map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => handleFilterChange(layer)}
                className={layerFilter === layer ? 'ui-tab-active' : 'ui-tab'}
              >
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="ui-alert-error mb-4">{error}</div>}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-app-border border-t-app-accent" />
            <p className="mt-2 ui-meta">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="ui-panel p-8 text-center">
            <p className="ui-meta">No questions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question._id}
                onClick={() => navigate(`/questions/${question._id}`)}
                className="ui-row"
              >
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h2 className="text-xl font-semibold text-app-text">{question.title}</h2>
                  <span className="ui-badge bg-app-accent-soft text-indigo-300 shrink-0">
                    {question.layer}
                  </span>
                </div>
                <p className="text-app-muted line-clamp-2">{question.reproSteps}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 ui-meta">
                  <span>Difficulty: {question.difficulty}</span>
                  <span>Created: {new Date(question.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
