'use client';
import { useEffect, useState } from 'react';
import { FileDown, Zap } from 'lucide-react';
import api from '@/lib/api';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const fetchPolicies = async () => {
    const query = statusFilter ? `?status=${statusFilter}` : '';
    const res = await api.get(`/policies${query}`);
    setPolicies(res.data.data.policies);
  };

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter]);

  const handleActivate = async (policyId) => {
    setLoadingId(policyId);
    try {
      await api.post(`/policies/${policyId}/activate`);
      await fetchPolicies();
    } catch (err) {
      alert(err.response?.data?.message || 'Activation failed');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownloadPdf = async (policy) => {
    try {
      const res = await api.get(`/policies/${policy._id}/certificate`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${policy.policyNumber}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download certificate');
    }
  };

  const badgeStyle = (status) => {
    if (status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Scheduled') return 'bg-sky-50 text-sky-700 border-sky-200';
    if (status === 'Void') return 'bg-slate-100 text-slate-500 border-slate-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Policy Ledger</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">Activate coverage and download official PDF certificates.</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Void">Void (Canceled)</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <th className="py-3.5 px-4">Policy #</th>
              <th className="py-3.5 px-4">Property</th>
              <th className="py-3.5 px-4">Check-In → Check-Out</th>
              <th className="py-3.5 px-4">Nights</th>
              <th className="py-3.5 px-4">Coverage Cap</th>
              <th className="py-3.5 px-4">Premium</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {policies.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No policies found for this filter.
                </td>
              </tr>
            ) : (
              policies.map((pol) => (
              <tr key={pol._id} className="transition-colors hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{pol.policyNumber}</td>
                  <td className="py-3.5 px-4 text-slate-800">{pol.propertyId?.title || 'Property'}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {new Date(pol.checkInDate).toLocaleDateString()} →{' '}
                    {new Date(pol.checkOutDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{pol.totalNights}</td>
                  <td className="py-3.5 px-4 text-slate-700">${pol.coverageLimit?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">${pol.totalPremium}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeStyle(pol.status)}`}>
                      {pol.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {pol.status === 'Scheduled' && (
                      <button
                        onClick={() => handleActivate(pol._id)}
                        disabled={loadingId === pol._id}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {loadingId === pol._id ? 'Activating...' : 'Activate'}
                      </button>
                    )}
                    {pol.status !== 'Void' && (
                      <button
                        onClick={() => handleDownloadPdf(pol)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
