import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suratAPI, unitAPI } from '../utils/api';
import { Plus, Search, Edit, Trash2, FileText, Download, Filter } from 'lucide-react';

function SuratList() {
  const [surat, setSurat] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Data Surat</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola arsip surat masuk dan keluar</p>
        </div>
        <Link 
          to="/surat/tambah" 
          className="btn-primary inline-flex items-center gap-2 justify-center whitespace-nowrap shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          <span>Tambah Surat</span>
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Filter size={18} />
            Filter Pencarian
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-800 lg:hidden"
          >
            {showFilters ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
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
              <div className="sm:col-span-2 lg:col-span-4">
                <button type="submit" className="btn-primary w-full sm:w-auto px-6 flex items-center gap-2 justify-center">
                  <Search size={18} />
                  Cari Surat
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-500">Memuat data...</div>
          </div>
        ) : surat.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Tidak ada data surat</p>
            <p className="text-sm mt-2">Silakan tambah surat baru atau ubah filter pencarian</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pengirim</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nomor Surat</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Perihal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {surat.map((item, index) => (
                    <tr key={item.id_surat} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-800 font-medium">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {new Date(item.tanggal_surat).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800 font-medium">{item.pengirim}</td>
                      <td className="px-4 py-4 text-sm text-gray-800 font-mono">{item.nomor_surat}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="truncate" title={item.perihal}>
                          {item.perihal}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {item.unit_list}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          {item.file_surat && (
                            <a
                              href={`http://localhost:5000/uploads/${item.file_surat}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download size={18} />
                            </a>
                          )}
                          <Link
                            to={`/surat/edit/${item.id_surat}`}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id_surat)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 gap-4">
                <div className="text-sm text-gray-600">
                  Halaman <span className="font-semibold">{pagination.page}</span> dari <span className="font-semibold">{pagination.totalPages}</span> 
                  <span className="hidden sm:inline"> ({pagination.total} total surat)</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Selanjutnya
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