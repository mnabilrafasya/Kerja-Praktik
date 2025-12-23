import { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import { FileText, TrendingUp, Calendar, Building2 } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Surat',
      value: stats?.totalSurat || 0,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Surat Tahun Ini',
      value: stats?.suratTahunIni || 0,
      icon: Calendar,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Surat per Unit */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 size={24} />
          Surat per Unit/Bidang
        </h2>
        <div className="space-y-3">
          {stats?.suratPerUnit?.map((unit) => (
            <div key={unit.id_unit} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{unit.kode_unit}</p>
                <p className="text-sm text-gray-600">{unit.nama_unit}</p>
              </div>
              <span className="text-2xl font-bold text-primary-600">{unit.jumlah}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Surat */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={24} />
          Surat Terbaru
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tanggal</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Pengirim</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nomor Surat</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Perihal</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.recentSurat?.map((surat) => (
                <tr key={surat.id_surat} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {new Date(surat.tanggal_surat).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{surat.pengirim}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{surat.nomor_surat}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{surat.perihal}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                      {surat.unit_list}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;