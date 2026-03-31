import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const RegistroInspeccion = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ nroLp: '', inspector: user?.username || '', fecha: '', observaciones: '', fotos: [] });
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, fotos: files }));

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Inspección registrada: ' + JSON.stringify({ ...form, inspector: user?.username }, null, 2));
    setForm({ nroLp: '', inspector: user?.username || '', fecha: '', observaciones: '', fotos: [] });
    setPreviews([]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Registro de inspección</h1>
          <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Cerrar sesión</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold">N° LP</label>
            <input value={form.nroLp} onChange={(e) => setForm((s) => ({ ...s, nroLp: e.target.value }))} className="w-full border p-2 rounded" required />
          </div>

          <div>
            <label className="block text-sm font-semibold">Inspector</label>
            <input value={form.inspector} disabled className="w-full border p-2 rounded bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm font-semibold">Fecha</label>
            <input type="date" value={form.fecha} onChange={(e) => setForm((s) => ({ ...s, fecha: e.target.value }))} className="w-full border p-2 rounded" required />
          </div>

          <div>
            <label className="block text-sm font-semibold">Observaciones</label>
            <textarea value={form.observaciones} onChange={(e) => setForm((s) => ({ ...s, observaciones: e.target.value }))} className="w-full border p-2 rounded" rows={4} required />
          </div>

          <div>
            <label className="block text-sm font-semibold">Fotos</label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full mt-1" />
            <div className="mt-3 flex gap-2 flex-wrap">
              {previews.map((src, idx) => (
                <img key={idx} src={src} alt={`preview-${idx}`} className="h-20 w-20 object-cover rounded" />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar inspección</button>
            <Link to="/inspector" className="px-4 py-2 border rounded hover:bg-gray-100">Volver a inspector</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroInspeccion;
