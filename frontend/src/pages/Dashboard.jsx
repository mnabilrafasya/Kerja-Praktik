import { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import { FileText, Calendar, Building2, TrendingUp } from 'lucide-react';

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
        <div className="animate-pulse text-gray-500">Memuat data...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Surat',
      value: stats?.totalSurat || 0,
      icon: FileText,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50'
    },
    {
      title: 'Surat Tahun Ini',
      value: stats?.suratTahunIni || 0,
      icon: Calendar,
      color: 'bg-green-500',
      bgLight: 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
        <span className="text-sm text-gray-500">Sistem Arsip Surat</span>
      </div>

      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-sm`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Surat per Unit - Responsive Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Building2 size={24} className="text-blue-600" />
          Surat per Unit/Bidang
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.suratPerUnit?.map((unit) => (
            <div key={unit.id_unit} className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-lg truncate">{unit.kode_unit}</p>
                  <p className="text-sm text-gray-600 truncate">{unit.nama_unit}</p>
                </div>
                <span className="text-3xl font-bold text-blue-600 ml-4">{unit.jumlah}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Surat - Responsive Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={24} className="text-green-600" />
            Surat Terbaru
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pengirim</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nomor Surat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Perihal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {stats?.recentSurat?.map((surat) => (
                <tr key={surat.id_surat} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {new Date(surat.tanggal_surat).toLocaleDateString('id-ID', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-800 font-medium">{surat.pengirim}</td>
                  <td className="px-4 py-4 text-sm text-gray-800 font-mono">{surat.nomor_surat}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">{surat.perihal}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
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