import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function Respondents() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('A');
  const [order, setOrder] = useState('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role, order, startDate, endDate]);

  async function fetchPage(q) {
    setLoading(true);
    const searchValue = q ?? search;
    const params = new URLSearchParams({
      page,
      pageSize,
      search: searchValue,
      role,
      order,
    });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    try {
      const data = await api.get(`/admin/respondents?${params.toString()}`);
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching respondents:', err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function onSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchPage(search);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Consultar Respondientes</h1>

      <form className="flex flex-wrap gap-2 mb-4 items-center" onSubmit={onSearch}>
        <input
          className="border px-3 py-2 rounded flex-1"
          placeholder="Buscar por nombre o cédula"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border px-2 py-2 rounded"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          title="Fecha inicio"
        />
        <input
          type="date"
          className="border px-2 py-2 rounded"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          title="Fecha fin"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border px-2 py-2 rounded">
          <option value="A">Perfil A</option>
          <option value="B">Perfil B</option>
          <option value="C">Perfil C</option>
          <option value="D">Perfil D</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)} className="border px-2 py-2 rounded">
          <option value="desc">Mayor → Menor</option>
          <option value="asc">Menor → Mayor</option>
        </select>
        <button className="bg-primary-500 text-white px-3 py-2 rounded">Buscar</button>
      </form>

      <div className="overflow-auto bg-white rounded shadow">
        <table className="w-full table-auto text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2">Cédula</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Perfil A</th>
              <th className="px-4 py-2">Perfil B</th>
              <th className="px-4 py-2">Perfil C</th>
              <th className="px-4 py-2">Perfil D</th>
              <th className="px-4 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-slate-500">Cargando...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-slate-500">No hay resultados</td>
              </tr>
            ) : (
              items.map((i) => (
                <tr key={i.surveyId} className="border-t">
                  <td className="px-4 py-2">{i.user.cedula}</td>
                  <td className="px-4 py-2">{i.user.name}</td>
                  <td className="px-4 py-2">{i.totalProfileA}</td>
                  <td className="px-4 py-2">{i.totalProfileB}</td>
                  <td className="px-4 py-2">{i.totalProfileC}</td>
                  <td className="px-4 py-2">{i.totalProfileD}</td>
                  <td className="px-4 py-2">{new Date(i.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-2 bg-slate-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <div>
          Página {page} / {totalPages}
        </div>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-2 bg-slate-200 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
