import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';
import { api } from '../../api/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

const PROFILE_NAMES = {
  A: 'Ideador',
  B: 'Clarificador',
  C: 'Desarrollador',
  D: 'Implementador',
};

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.admin.surveys(), api.admin.summary()])
      .then(([surveysData, summaryData]) => {
        setSurveys(surveysData);
        setSummary(summaryData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-slate-500">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const barData = summary
    ? {
        labels: Object.keys(PROFILE_NAMES).map((k) => PROFILE_NAMES[k]),
        datasets: [
          {
            label: 'Puntos acumulados (todas las encuestas)',
            data: [
              summary.profiles.A,
              summary.profiles.B,
              summary.profiles.C,
              summary.profiles.D,
            ],
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(34, 197, 94, 0.7)',
              'rgba(234, 179, 8, 0.7)',
              'rgba(239, 68, 68, 0.7)',
            ],
          },
        ],
      }
    : null;

  const radarData = summary
    ? {
        labels: Object.keys(PROFILE_NAMES).map((k) => PROFILE_NAMES[k]),
        datasets: [
          {
            label: 'Totales por perfil',
            data: [
              summary.profiles.A,
              summary.profiles.B,
              summary.profiles.C,
              summary.profiles.D,
            ],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)',
          },
        ],
      }
    : null;

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: { beginAtZero: true },
    },
  };

  const totalSurveys = summary?.totalSurveys ?? 0;
  const profileKeys = ['A', 'B', 'C', 'D'];

  const averages = totalSurveys > 0 && summary
    ? {
        A: Math.round((summary.profiles.A / totalSurveys) * 10) / 10,
        B: Math.round((summary.profiles.B / totalSurveys) * 10) / 10,
        C: Math.round((summary.profiles.C / totalSurveys) * 10) / 10,
        D: Math.round((summary.profiles.D / totalSurveys) * 10) / 10,
      }
    : { A: 0, B: 0, C: 0, D: 0 };

  const dominantCount = { A: 0, B: 0, C: 0, D: 0 };
  surveys.forEach((s) => {
    const t = s.totals || {};
    const max = Math.max(t.A ?? 0, t.B ?? 0, t.C ?? 0, t.D ?? 0);
    const key = profileKeys.find((k) => (t[k] ?? 0) === max);
    if (key) dominantCount[key]++;
  });

  const dominantPercent =
    totalSurveys > 0
      ? {
          A: Math.round((dominantCount.A / totalSurveys) * 1000) / 10,
          B: Math.round((dominantCount.B / totalSurveys) * 1000) / 10,
          C: Math.round((dominantCount.C / totalSurveys) * 1000) / 10,
          D: Math.round((dominantCount.D / totalSurveys) * 1000) / 10,
        }
      : { A: 0, B: 0, C: 0, D: 0 };

  const averageChartData = {
    labels: profileKeys.map((k) => PROFILE_NAMES[k]),
    datasets: [
      {
        label: 'Promedio de puntos',
        data: [averages.A, averages.B, averages.C, averages.D],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
      },
    ],
  };

  const countChartData = {
    labels: profileKeys.map((k) => PROFILE_NAMES[k]),
    datasets: [
      {
        label: 'Cantidad de personas',
        data: [dominantCount.A, dominantCount.B, dominantCount.C, dominantCount.D],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
      },
    ],
  };

  const percentChartData = {
    labels: profileKeys.map((k) => PROFILE_NAMES[k]),
    datasets: [
      {
        data: [dominantPercent.A, dominantPercent.B, dominantPercent.C, dominantPercent.D],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {summary && (
        <p className="text-slate-600">
          Total de encuestas: <strong>{summary.totalSurveys}</strong>
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {barData && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Perfiles acumulados (barras)</h3>
            <Bar data={barData} options={barOptions} />
          </div>
        )}
        {radarData && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Comparativa por perfil (radar)</h3>
            <Radar data={radarData} options={radarOptions} />
          </div>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
          Estadísticas por perfil
        </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Promedio por perfil</h3>
          <p className="text-slate-500 text-sm mb-2">Puntos promedio por encuesta en cada perfil</p>
          {totalSurveys > 0 ? (
            <div className="h-64">
              <Bar
                data={averageChartData}
                options={{ ...barOptions, plugins: { legend: { display: false } }, maintainAspectRatio: false }}
              />
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center">Sin encuestas aún</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Porcentaje de personas por perfil</h3>
          <p className="text-slate-500 text-sm mb-2">% de encuestados cuyo perfil dominante es cada uno</p>
          {totalSurveys > 0 ? (
            <div className="h-64">
              <Doughnut
                data={percentChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center">Sin encuestas aún</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Cantidad de personas por perfil</h3>
          <p className="text-slate-500 text-sm mb-2">Nº de personas con cada perfil dominante</p>
          {totalSurveys > 0 ? (
            <div className="h-64">
              <Bar
                data={countChartData}
                options={{ ...barOptions, plugins: { legend: { display: false } }, maintainAspectRatio: false }}
              />
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center">Sin encuestas aún</p>
          )}
        </div>
      </div>
      </section>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <h3 className="font-semibold text-slate-800 p-4 border-b">Encuestas realizadas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 font-medium text-slate-700">Fecha</th>
                <th className="px-4 py-3 font-medium text-slate-700">Usuario</th>
                <th className="px-4 py-3 font-medium text-slate-700">Cédula</th>
                <th className="px-4 py-3 font-medium text-slate-700">Ideador (A)</th>
                <th className="px-4 py-3 font-medium text-slate-700">Clarificador (B)</th>
                <th className="px-4 py-3 font-medium text-slate-700">Desarrollador (C)</th>
                <th className="px-4 py-3 font-medium text-slate-700">Implementador (D)</th>
              </tr>
            </thead>
            <tbody>
              {surveys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Aún no hay encuestas.
                  </td>
                </tr>
              ) : (
                surveys.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(s.createdAt).toLocaleString('es')}
                    </td>
                    <td className="px-4 py-3">{s.user?.name ?? '-'}</td>
                    <td className="px-4 py-3">{s.user?.cedula ?? '-'}</td>
                    <td className="px-4 py-3">{s.totals?.A ?? 0}</td>
                    <td className="px-4 py-3">{s.totals?.B ?? 0}</td>
                    <td className="px-4 py-3">{s.totals?.C ?? 0}</td>
                    <td className="px-4 py-3">{s.totals?.D ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
