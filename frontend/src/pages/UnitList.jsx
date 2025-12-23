import { useState, useEffect } from 'react';
import { unitAPI } from '../utils/api';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

function UnitList() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({ kode_unit: '', nama_unit: '' });

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const response = await unitAPI.getAll();
      setUnits(response.data);
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUnit(null);
    setFormData({ kode_unit: '', nama_unit: '' });
    setShowModal(true);
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({ kode_unit: unit.kode_unit, nama_unit: unit.nama_unit });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus unit ini?')) {
      try {
        await unitAPI.delete(id);
        loadUnits();
        alert('Unit berhasil dihapus');
      } catch (error) {
        alert('Gagal menghapus unit');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await unitAPI.update(editingUnit.id_unit, formData);
        alert('Unit berhasil diupdate');
      } else {
        await unitAPI.create(formData);
        alert('Unit berhasil ditambahkan');
      }
      setShowModal(false);
      loadUnits();
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Data Unit/Bidang</h1>
        <button onClick={handleAdd} className="btn-primary inline-flex items-center gap-2 justify-center">
          <Plus size={20} />
          Tambah Unit
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : units.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 size={48} className="mx-auto mb-2 text-gray-400" />
            <p>Tidak ada data unit</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Kode Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nama Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {units.map((unit, index) => (
                  <tr key={unit.id_unit} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{unit.kode_unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{unit.nama_unit}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(unit)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id_unit)}
                          className="text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingUnit ? 'Edit Unit' : 'Tambah Unit'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.kode_unit}
                  onChange={(e) => setFormData({ ...formData, kode_unit: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama_unit}
                  onChange={(e) => setFormData({ ...formData, nama_unit: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnitList;