import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { suratAPI, unitAPI } from '../utils/api';
import { ArrowLeft, Save } from 'lucide-react';

function SuratForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    pengirim: '',
    nomor_surat: '',
    tanggal_surat: '',
    perihal: '',
    tahun: new Date().getFullYear(),
    unit_ids: []
  });
  const [file, setFile] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUnits();
    if (isEdit) {
      loadSurat();
    }
  }, [id]);

  const loadUnits = async () => {
    try {
      const response = await unitAPI.getAll();
      setUnits(response.data);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const loadSurat = async () => {
    try {
      const response = await suratAPI.getById(id);
      const data = response.data;
      setFormData({
        pengirim: data.pengirim,
        nomor_surat: data.nomor_surat,
        tanggal_surat: data.tanggal_surat.split('T')[0],
        perihal: data.perihal,
        tahun: data.tahun,
        unit_ids: data.unit_list ? data.unit_list.split(', ').map(code => {
          const unit = units.find(u => u.kode_unit === code);
          return unit ? unit.id_unit : null;
        }).filter(Boolean) : []
      });
    } catch (error) {
      console.error('Error loading surat:', error);
      alert('Gagal memuat data surat');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleUnitChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map(option => parseInt(option.value));
    setFormData({ ...formData, unit_ids: values });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('pengirim', formData.pengirim);
      data.append('nomor_surat', formData.nomor_surat);
      data.append('tanggal_surat', formData.tanggal_surat);
      data.append('perihal', formData.perihal);
      data.append('tahun', formData.tahun);
      data.append('unit_ids', JSON.stringify(formData.unit_ids));
      
      if (file) {
        data.append('file_surat', file);
      }

      if (isEdit) {
        await suratAPI.update(id, data);
        alert('Surat berhasil diupdate');
      } else {
        await suratAPI.create(data);
        alert('Surat berhasil ditambahkan');
      }
      
      navigate('/surat');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/surat')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {isEdit ? 'Edit Surat' : 'Tambah Surat'}
        </h1>
      </div>

      <div className="card max-w-3xl">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pengirim <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pengirim"
              value={formData.pengirim}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nomor_surat"
                value={formData.nomor_surat}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_surat"
                value={formData.tanggal_surat}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perihal <span className="text-red-500">*</span>
            </label>
            <textarea
              name="perihal"
              value={formData.perihal}
              onChange={handleChange}
              rows="3"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                min="2000"
                max="2100"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit/Bidang <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                value={formData.unit_ids}
                onChange={handleUnitChange}
                className="input-field h-32"
                required
              >
                {units.map(unit => (
                  <option key={unit.id_unit} value={unit.id_unit}>
                    {unit.kode_unit} - {unit.nama_unit}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Tahan Ctrl/Cmd untuk memilih multiple unit
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Lampiran (PDF, DOC, DOCX, JPG, PNG - Max 5MB)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="input-field"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/surat')}
              className="btn-secondary"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SuratForm;