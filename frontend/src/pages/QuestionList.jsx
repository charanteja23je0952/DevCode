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
    if (layer === 'all') {
      searchParams.delete('layer');
    } else {
      searchParams.set('layer', layer);
    }
    setSearchParams(searchParams);
  };

  const layers = ['all', 'backend', 'frontend', 'fullstack'];

  return (
    <div className="bg-app-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-app-text">Questions</h1>
        </div>

        <div className="bg-app-panel rounded-lg shadow mb-6 p-2">
          <div className="flex space-x-2">
            {layers.map((layer) => (
              <button
                key={layer}
                onClick={() => handleFilterChange(layer)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  layerFilter === layer
                    ? 'bg-blue-600 text-white'
                    : 'text-app-text hover:bg-app-hover'
                }`}
              >
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="mt-2 text-app-muted">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-app-panel rounded-lg shadow p-8 text-center">
            <p className="text-app-muted">No questions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question._id}
                onClick={() => navigate(`/questions/${question._id}`)}
                className="bg-app-panel rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-app-text">{question.title}</h2>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-900/30 text-blue-400">
                    {question.layer}
                  </span>
                </div>
                <p className="text-app-muted line-clamp-2">{question.reproSteps}</p>
                <div className="mt-4 flex items-center text-sm text-app-muted">
                  <span className="mr-4">Difficulty: {question.difficulty}</span>
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
