import { useState, useEffect } from 'react';
import { api } from '../../api/client';

const PROFILE_LABELS = { A: 'Ideador', B: 'Clarificador', C: 'Desarrollador', D: 'Implementador' };

export default function ImportExport() {
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmImport, setConfirmImport] = useState(null);

  const loadQuestions = () => {
    setQuestionsLoading(true);
    api.admin
      .questions()
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setQuestionsLoading(false));
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleExportQuestions = async (format) => {
    try {
      const data = await api.admin.exportQuestions(format);
      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions.csv';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(err.message || 'Error al exportar');
    }
  };

  const handleExportResults = async (format) => {
    try {
      const data = await api.admin.exportResults(format);
      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'results.csv';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'results.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(err.message || 'Error al exportar');
    }
  };

  const handleImportClick = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setImportError('Selecciona un archivo');
      return;
    }
    setImportError('');
    setImportResult(null);
    try {
      const stats = await api.admin.importStats();
      setConfirmImport({ file: importFile, stats });
    } catch (err) {
      setImportError(err.message || 'Error al validar');
    }
  };

  const handleConfirmImport = async () => {
    if (!confirmImport) return;
    const { file, stats } = confirmImport;
    setLoading(true);
    setConfirmImport(null);
    try {
      const result = await api.admin.importQuestions(file);
      setImportResult(result);
      setImportFile(null);
      document.querySelector('input[type="file"]')?.form?.reset();
      loadQuestions();
    } catch (err) {
      setImportError(err.message || 'Error al importar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelImport = () => {
    setConfirmImport(null);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Importar / Exportar</h1>

      <section className="bg-white rounded-xl shadow overflow-hidden">
        <h2 className="font-semibold text-slate-800 p-4 border-b border-slate-200">
          Preguntas actuales ({questions.length})
        </h2>
        {questionsLoading ? (
          <p className="p-6 text-slate-500">Cargando preguntas...</p>
        ) : questions.length === 0 ? (
          <p className="p-6 text-slate-500">No hay preguntas cargadas.</p>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-slate-700 w-12">#</th>
                  <th className="px-4 py-3 font-medium text-slate-700 w-24">Orden</th>
                  <th className="px-4 py-3 font-medium text-slate-700 w-28">Perfil</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Texto</th>
                  <th className="px-4 py-3 font-medium text-slate-700 w-20">Ejemplo</th>
                  <th className="px-4 py-3 font-medium text-slate-700 w-20">Activa</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, idx) => (
                  <tr key={q.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2">{q.order}</td>
                    <td className="px-4 py-2">
                      <span className="font-medium">{PROFILE_LABELS[q.profile] || q.profile}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-700">{q.text}</td>
                    <td className="px-4 py-2">{q.isExample ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2">{q.active ? 'Sí' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Exportar preguntas</h3>
          <p className="text-slate-600 text-sm mb-4">
            Descarga el listado de preguntas en CSV o JSON.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleExportQuestions('csv')}
              className="btn-primary"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => handleExportQuestions('json')}
              className="btn-secondary"
            >
              Exportar JSON
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Exportar resultados</h3>
          <p className="text-slate-600 text-sm mb-4">
            Descarga todas las encuestas y puntuaciones por perfil en CSV o JSON.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleExportResults('csv')}
              className="btn-primary"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => handleExportResults('json')}
              className="btn-secondary"
            >
              Exportar JSON
            </button>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Importar preguntas</h3>
        <p className="text-slate-600 text-sm mb-4">
          Sube un archivo CSV o JSON de <strong>preguntas</strong> (no el de resultados). Formato CSV: columnas <code className="bg-slate-100 px-1 rounded">text</code>, <code className="bg-slate-100 px-1 rounded">profile</code>, <code className="bg-slate-100 px-1 rounded">order</code>, <code className="bg-slate-100 px-1 rounded">isExample</code>, <code className="bg-slate-100 px-1 rounded">active</code>. JSON: array de objetos con las mismas propiedades.
        </p>
        <form onSubmit={handleImportClick} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !importFile}
            className="btn-primary disabled:opacity-60"
          >
            {loading ? 'Importando...' : 'Importar'}
          </button>
        </form>
        {importError && (
          <p className="text-red-600 text-sm mt-2">{importError}</p>
        )}
        {importResult && (
          <p className="text-green-600 text-sm mt-2">
            {importResult.message}. Preguntas importadas: {importResult.count}.
          </p>
        )}
      </section>

      {confirmImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Confirmar reemplazo de preguntas</h3>
            <p className="text-slate-600 text-sm mb-4">
              Actualmente hay <strong>{confirmImport.stats.questionCount}</strong> preguntas
              y <strong>{confirmImport.stats.answerCount}</strong> respuestas detalladas.
            </p>
            <p className="text-slate-600 text-sm mb-4">
              Al importar se <strong>reemplazarán todas las preguntas</strong> por las del archivo
              y se <strong>eliminarán las respuestas detalladas</strong> (los totales por encuesta en el Dashboard se conservan).
            </p>
            <p className="text-slate-700 font-medium mb-4">¿Desea continuar?</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelImport}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="btn-primary"
              >
                Sí, reemplazar preguntas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
