import { useNavigate } from 'react-router-dom';

export default function SinAcceso() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-900 mb-4">403</h1>
        <p className="text-slate-600 mb-6">No tienes permiso para acceder a esta sección.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          Volver
        </button>
      </div>
    </div>
  );
}