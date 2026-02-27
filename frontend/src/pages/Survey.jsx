import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ScoreBar from '../components/ScoreBar';

const TUTORIAL_STEP = 'tutorial';
const QUESTION_STEP = 'question';
const THANKS_STEP = 'thanks';

export default function Survey() {
  const { user, logout } = useAuth();
  const [step, setStep] = useState(TUTORIAL_STEP);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .questions()
      .then(setQuestions)
      .catch(() => setError('No se pudieron cargar las preguntas'))
      .finally(() => setLoading(false));
  }, []);

  const realQuestions = questions.filter((q) => !q.isExample);
  const currentQuestion = questions[currentIndex];

  const handleTutorialNext = () => setStep(QUESTION_STEP);

  const handleAnswer = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      submitSurvey();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const submitSurvey = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = Object.entries(answers).map(([questionId, value]) => ({
        questionId: Number(questionId),
        value: Number(value),
      }));
      await api.surveys.submit(payload);
      setStep(THANKS_STEP);
    } catch (err) {
      setError(err.message || 'Error al guardar la encuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const canGoNext = () => {
    const q = currentQuestion;
    if (!q) return false;
    const val = answers[q.id];
    return val !== undefined && val !== null && val >= 1 && val <= 10;
  };

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Cargando encuesta...</div>
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (step === TUTORIAL_STEP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <header className="max-w-2xl mx-auto flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-slate-800">Encuesta de perfiles técnicos</h1>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-sm">{user?.name}</span>
            <button onClick={logout} className="text-slate-500 hover:text-slate-700 text-sm">
              Salir
            </button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Cómo responder</h2>
          <ul className="space-y-4 text-slate-700">
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold">1.</span>
              Responde cada pregunta con un puntaje del <strong>1 al 10</strong>.
            </li>
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold">2.</span>
              Los puntajes significan:
              <ul className="mt-2 ml-6 space-y-1 text-sm">
                <li><strong>1 a 4</strong> → Para nada parecido a mí</li>
                <li><strong>6 a 7</strong> → Parecido a mí</li>
                <li><strong>8 a 10</strong> → Muy parecido a mí</li>
              </ul>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold">3.</span>
              No verás a qué perfil corresponde cada pregunta; esa información es solo para el administrador.
            </li>
          </ul>
          <div className="mt-8">
            <ScoreBar value={answers[0]} onChange={() => {}} />
            <p className="text-slate-500 text-sm mt-2">Usa la barra así para elegir tu puntuación en cada pregunta.</p>
          </div>
          <button
            onClick={handleTutorialNext}
            className="btn-primary mt-8 w-full md:w-auto px-8 py-3"
          >
            Entendido, empezar encuesta
          </button>
        </div>
      </div>
    );
  }

  if (step === THANKS_STEP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center animate-fade-in">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Gracias por participar!</h2>
          <p className="text-slate-600">
            Tu encuesta ha sido guardada correctamente. Agradecemos tu tiempo y tus respuestas.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={logout} className="btn-secondary">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <header className="max-w-2xl mx-auto flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-slate-800">Encuesta de perfiles técnicos</h1>
        <span className="text-slate-500 text-sm">
          {currentIndex + 1} / {questions.length}
        </span>
      </header>

      <div className="max-w-2xl mx-auto mb-4 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in">
        {currentQuestion && (
          <>
            <p className="text-slate-700 text-lg mb-6">
              {currentQuestion.isExample && (
                <span className="text-amber-600 font-medium block mb-2">[Pregunta de ejemplo]</span>
              )}
              {currentQuestion.text}
            </p>
            <ScoreBar
              value={answers[currentQuestion.id]}
              onChange={handleAnswer}
            />
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext() || submitting}
                className="btn-primary disabled:opacity-60"
              >
                {submitting
                  ? 'Guardando...'
                  : currentIndex === questions.length - 1
                  ? 'Enviar encuesta'
                  : 'Siguiente'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
