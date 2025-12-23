import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suratAPI, unitAPI } from '../utils/api';
import { Plus, Search, Edit, Trash2, FileText, Download } from 'lucide-react';

function SuratList() {
  const [surat, setSurat] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    tahun: '',
    unit: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    loadSurat();
  }, [filters]);

  const loadUnits = async () => {
    try {
      const response = await unitAPI.getAll();
      setUnits(response.data);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const loadSurat = async () => {
    setLoading(true);
    try {
      const response = await suratAPI.getAll(filters);
      setSurat(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading surat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadSurat();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      try {
        await suratAPI.delete(id);
        loadSurat();
        alert('Surat berhasil dihapus');
      } catch (error) {
        alert('Gagal menghapus surat');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Data Surat</h1>
        <Link to="/surat/tambah" className="btn-primary inline-flex items-center gap-2 justify-center">
          <Plus size={20} />
          Tambah Surat
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Surat
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Pengirim, nomor, perihal..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun
            </label>
            <select
              name="tahun"
              value={filters.tahun}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">Semua Tahun</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit/Bidang
            </label>
            <select
              name="unit"
              value={filters.unit}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">Semua Unit</option>
              {units.map(unit => (
                <option key={unit.id_unit} value={unit.kode_unit}>
                  {unit.kode_unit}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full flex items-center gap-2 justify-center">
              <Search size={18} />
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : surat.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-2 text-gray-400" />
            <p>Tidak ada data surat</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">No</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Pengirim</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nomor Surat</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Perihal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {surat.map((item, index) => (
                    <tr key={item.id_surat} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(item.tanggal_surat).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{item.pengirim}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{item.nomor_surat}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {item.perihal}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                          {item.unit_list}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          {item.file_surat && (
                            <a
                              href={`http://localhost:5000/uploads/${item.file_surat}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800"
                              title="Download"
                            >
                              <Download size={18} />
                            </a>
                          )}
                          <Link
                            to={`/surat/edit/${item.id_surat}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id_surat)}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SuratList;