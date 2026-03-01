import { useState, useEffect } from 'react';
import { api } from '../../api/client';

const PROFILE_LABELS = { A: 'Ideador', B: 'Clarificador', C: 'Desarrollador', D: 'Implementador' };

const emptyForm = { text: '', profile: 'A', order: '', isExample: false, active: true };

export default function ImportExport() {
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmImport, setConfirmImport] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newQuestion, setNewQuestion] = useState(emptyForm);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const loadQuestions = () => {
    setQuestionsLoading(true);
    api.admin.questions().then(setQuestions).catch(() => setQuestions([])).finally(() => setQuestionsLoading(false));
  };

  useEffect(() => { loadQuestions(); }, []);

  const handleDeleteClick = (q) => setConfirmDelete(q);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.admin.deleteQuestion(confirmDelete.id);
      setConfirmDelete(null);
      loadQuestions();
    } catch (err) {
      alert(err.message || 'Error al eliminar');
      setConfirmDelete(null);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.text.trim()) { setAddError('El texto es obligatorio'); return; }
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');
    try {
      await api.admin.createQuestion(newQuestion);
      setAddSuccess('Pregunta agregada correctamente');
      setNewQuestion(emptyForm);
      loadQuestions();
    } catch (err) {
      setAddError(err.message || 'Error al agregar');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditClick = (q) => {
    setEditingQuestion(q);
    setEditForm({ text: q.text, profile: q.profile, order: q.order, isExample: q.isExample, active: q.active });
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editForm.text?.trim()) { setEditError('El texto es obligatorio'); return; }
    setEditLoading(true);
    try {
      await api.admin.updateQuestion(editingQuestion.id, editForm);
      setEditingQuestion(null);
      loadQuestions();
    } catch (err) {
      setEditError(err.message || 'Error al guardar');
    } finally {
      setEditLoading(false);
    }
  };

  const handleExportQuestions = async (format) => {
    try {
      const data = await api.admin.exportQuestions(format);
      const blob = format === 'csv' ? new Blob([data], { type: 'text/csv;charset=utf-8' }) : new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `questions.${format}`; a.click(); URL.revokeObjectURL(url);
    } catch (err) { alert(err.message || 'Error al exportar'); }
  };

  const handleExportResults = async (format) => {
    try {
      const data = await api.admin.exportResults(format);
      const blob = format === 'csv' ? new Blob([data], { type: 'text/csv;charset=utf-8' }) : new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `results.${format}`; a.click(); URL.revokeObjectURL(url);
    } catch (err) { alert(err.message || 'Error al exportar'); }
  };

  const handleImportClick = async (e) => {
    e.preventDefault();
    if (!importFile) { setImportError('Selecciona un archivo'); return; }
    setImportError(''); setImportResult(null);
    try {
      const stats = await api.admin.importStats();
      setConfirmImport({ file: importFile, stats });
    } catch (err) { setImportError(err.message || 'Error al validar'); }
  };

  const handleConfirmImport = async () => {
    if (!confirmImport) return;
    setLoading(true); setConfirmImport(null);
    try {
      const result = await api.admin.importQuestions(confirmImport.file);
      setImportResult(result); setImportFile(null);
      document.querySelector('input[type="file"]')?.form?.reset();
      loadQuestions();
    } catch (err) { setImportError(err.message || 'Error al importar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Importar / Exportar</h1>

      {/* TABLA DE PREGUNTAS */}
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
                  <th className="px-4 py-3 font-medium text-slate-700 w-20">Orden</th>
                  <th className="px-4 py-3 font-medium text-slate-700 w-28">Perfil</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Texto</th>
                  <th className="px-4 py-3 font-medium text-slate-700 w-20">Ejemplo</th>
                  <th className="px-4 py-3 font-medium text-slate-700 w-20">Activa</th>
                  <th className="px-4 py-3 font-medium text-slate-700 w-32">Acción</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, idx) => (
                  <tr key={q.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2">{q.order}</td>
                    <td className="px-4 py-2"><span className="font-medium">{PROFILE_LABELS[q.profile] || q.profile}</span></td>
                    <td className="px-4 py-2 text-slate-700">{q.text}</td>
                    <td className="px-4 py-2">{q.isExample ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2">{q.active ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => handleEditClick(q)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(q)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* AGREGAR PREGUNTA MANUAL */}
      <section className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Agregar pregunta manualmente</h3>
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Texto de la pregunta *</label>
            <textarea
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe la pregunta aquí..."
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Perfil *</label>
              <select
                value={newQuestion.profile}
                onChange={(e) => setNewQuestion({ ...newQuestion, profile: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(PROFILE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v} ({k})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Orden</label>
              <input
                type="number"
                value={newQuestion.order}
                onChange={(e) => setNewQuestion({ ...newQuestion, order: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="999"
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newQuestion.isExample}
                  onChange={(e) => setNewQuestion({ ...newQuestion, isExample: e.target.checked })}
                  className="w-4 h-4"
                />
                Es ejemplo
              </label>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newQuestion.active}
                  onChange={(e) => setNewQuestion({ ...newQuestion, active: e.target.checked })}
                  className="w-4 h-4"
                />
                Activa
              </label>
            </div>
          </div>
          {addError && <p className="text-red-600 text-sm">{addError}</p>}
          {addSuccess && <p className="text-green-600 text-sm">{addSuccess}</p>}
          <button
            type="submit"
            disabled={addLoading}
            className="btn-primary disabled:opacity-60"
          >
            {addLoading ? 'Agregando...' : 'Agregar pregunta'}
          </button>
        </form>
      </section>

      {/* EXPORTAR */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Exportar preguntas</h3>
          <div className="flex gap-3">
            <button onClick={() => handleExportQuestions('csv')} className="btn-primary">Exportar CSV</button>
            <button onClick={() => handleExportQuestions('json')} className="btn-secondary">Exportar JSON</button>
          </div>
        </section>
        <section className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Exportar resultados</h3>
          <div className="flex gap-3">
            <button onClick={() => handleExportResults('csv')} className="btn-primary">Exportar CSV</button>
            <button onClick={() => handleExportResults('json')} className="btn-secondary">Exportar JSON</button>
          </div>
        </section>
      </div>

      {/* IMPORTAR */}
      <section className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Importar preguntas</h3>
        <form onSubmit={handleImportClick} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="file" accept=".csv,.json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
          <button type="submit" disabled={loading || !importFile} className="btn-primary disabled:opacity-60">
            {loading ? 'Importando...' : 'Importar'}
          </button>
        </form>
        {importError && <p className="text-red-600 text-sm mt-2">{importError}</p>}
        {importResult && <p className="text-green-600 text-sm mt-2">{importResult.message}. Preguntas importadas: {importResult.count}.</p>}
      </section>

      {/* MODAL EDITAR PREGUNTA */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Editar pregunta</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Texto *</label>
                <textarea
                  value={editForm.text}
                  onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Perfil</label>
                  <select
                    value={editForm.profile}
                    onChange={(e) => setEditForm({ ...editForm, profile: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(PROFILE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v} ({k})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Orden</label>
                  <input
                    type="number"
                    value={editForm.order}
                    onChange={(e) => setEditForm({ ...editForm, order: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isExample}
                    onChange={(e) => setEditForm({ ...editForm, isExample: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Es ejemplo
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Activa
                </label>
              </div>
              {editError && <p className="text-red-600 text-sm">{editError}</p>}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditingQuestion(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={editLoading} className="btn-primary disabled:opacity-60">
                {editLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-2">¿Eliminar pregunta?</h3>
            <p className="text-slate-600 text-sm mb-4">"{confirmDelete.text}"</p>
            <p className="text-slate-500 text-sm mb-4">Se eliminarán también las respuestas asociadas a esta pregunta.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR IMPORTAR */}
      {confirmImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Confirmar reemplazo de preguntas</h3>
            <p className="text-slate-600 text-sm mb-4">Actualmente hay <strong>{confirmImport.stats.questionCount}</strong> preguntas y <strong>{confirmImport.stats.answerCount}</strong> respuestas detalladas.</p>
            <p className="text-slate-600 text-sm mb-4">Al importar se <strong>reemplazarán todas las preguntas</strong> y se <strong>eliminarán las respuestas detalladas</strong>.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmImport(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleConfirmImport} className="btn-primary">Sí, reemplazar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
