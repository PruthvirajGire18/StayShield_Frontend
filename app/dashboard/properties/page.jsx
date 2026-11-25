'use client';
import { useEffect, useState } from 'react';
import { Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import AddPropertyModal from '@/components/AddPropertyModal';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [syncingId, setSyncingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProperties = async () => {
    const res = await api.get('/properties');
    setProperties(res.data.data);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSyncNow = async (propertyId) => {
    setSyncingId(propertyId);
    try {
      await api.post(`/properties/${propertyId}/sync-now`);
      await fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Properties & Calendar Feeds</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">Manage connected Airbnb/Vrbo .ics links and coverage tiers.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {properties.map((prop) => (
          <div key={prop._id} className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
              <div className="min-w-0">
                <h3 className="break-words text-lg font-bold tracking-tight text-slate-950">{prop.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {prop.propertyType} · {prop.address?.city}, {prop.address?.country}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {prop.coverageTier} (${prop.baseNightlyRate}/nt)
              </span>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                <span>Connected Feeds ({prop.calendarFeeds?.length || 0})</span>
                <button
                  onClick={() => handleSyncNow(prop._id)}
                  disabled={syncingId === prop._id}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingId === prop._id ? 'animate-spin' : ''}`} />
                  {syncingId === prop._id ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              {prop.calendarFeeds?.map((feed) => (
                <div
                  key={feed._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-xs"
                >
                  <span className="font-medium text-slate-800">{feed.platform} Calendar</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    {feed.syncStatus === 'Healthy' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Failing
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProperties}
      />
    </div>
  );
}
