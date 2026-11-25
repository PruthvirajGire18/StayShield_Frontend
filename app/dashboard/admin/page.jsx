'use client';
import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Users,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminWorkbenchPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('claims'); // 'claims' | 'users'
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [approvedGross, setApprovedGross] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (role) => {
    try {
      const claimsRes = await api.get('/claims/admin/all');
      const fetchedClaims = claimsRes.data.data || [];
      setClaims(fetchedClaims);

      if (fetchedClaims.length > 0 && !selectedClaim) {
        const first = fetchedClaims[0];
        setSelectedClaim(first);
        setApprovedGross(first.totalClaimedAmount);
        setNotes(first.adjusterNotes || '');
      }
    } catch (err) {
      console.error(err);
    }

    // Sirf super_admin ke liye overview API call karo
    if (role === 'super_admin') {
      try {
        const ovRes = await api.get('/admin/overview');
        setOverview(ovRes.data.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setOverview(null);
      setActiveTab('claims');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('stayshield_user');
    const parsed = saved ? JSON.parse(saved) : null;
    setCurrentUser(parsed);
    fetchData(parsed?.role);
  }, []);

  const handleAdjudicate = async (status) => {
    if (!selectedClaim) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/claims/admin/${selectedClaim._id}/adjudicate`, {
        status,
        approvedGrossAmount: Number(approvedGross || selectedClaim.totalClaimedAmount),
        adjusterNotes: notes,
      });
      setSelectedClaim(res.data.data);
      await fetchData(currentUser?.role);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      await fetchData(currentUser?.role);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSuperAdmin ? 'Super Admin & Underwriting Console' : 'Claims Adjudication Workbench'}
          </h1>
          <p className="text-sm text-slate-500">
            {isSuperAdmin
              ? 'Adjudicate damage claims, inspect evidence, and manage platform user roles.'
              : 'Review submitted guest damage claims, inspect evidence, and approve payouts.'}
          </p>
        </div>

        {isSuperAdmin && overview && (
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'claims' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Claims Queue ({claims.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users & Roles ({overview.users.length})
            </button>
          </div>
        )}
      </div>

      {/* Super Admin Platform KPIs (Adjuster ko hide rahega) */}
      {isSuperAdmin && overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{overview.stats.totalUsers}</p>
            </div>
            <Users className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Active Policies</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {overview.stats.activePolicies} / {overview.stats.totalPolicies}
              </p>
            </div>
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Premium Volume</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${overview.stats.totalPremiumVolume}</p>
            </div>
            <DollarSign className="w-7 h-7 text-amber-600" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Approved Payouts</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">${overview.stats.totalApprovedPayouts}</p>
            </div>
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>
        </div>
      )}

      {/* TAB 1: CLAIMS ADJUDICATION */}
      {activeTab === 'claims' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Claims Table */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-3 px-4">Claim #</th>
                  <th className="py-3 px-4">Host & Property</th>
                  <th className="py-3 px-4">Claimed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No claims submitted yet.
                    </td>
                  </tr>
                ) : (
                  claims.map((clm) => (
                    <tr
                      key={clm._id}
                      onClick={() => {
                        setSelectedClaim(clm);
                        setApprovedGross(clm.totalClaimedAmount);
                        setNotes(clm.adjusterNotes || '');
                      }}
                      className={`cursor-pointer hover:bg-slate-50 ${
                        selectedClaim?._id === clm._id ? 'bg-emerald-50/70' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{clm.claimNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{clm.propertyId?.title}</div>
                        <div className="text-xs text-slate-500">{clm.hostId?.fullName}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">${clm.totalClaimedAmount}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                          {clm.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-semibold text-xs">
                        Inspect →
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Evidence & Payout Inspector */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            {!selectedClaim ? (
              <p className="text-sm text-slate-400 text-center py-12">Select a claim to inspect.</p>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">{selectedClaim.claimNumber}</span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700">
                      {selectedClaim.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mt-1">{selectedClaim.propertyId?.title}</h3>
                  <p className="text-xs text-slate-500">
                    Policy Cap: ${selectedClaim.policyId?.coverageLimit?.toLocaleString()} · Deductible: $
                    {selectedClaim.policyId?.deductibleAmount || 0}
                  </p>
                </div>

                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                  <p className="font-semibold text-xs uppercase text-slate-500 mb-1">Incident Report</p>
                  <p>{selectedClaim.description}</p>
                </div>

                <div>
                  <p className="font-semibold text-xs uppercase text-slate-500 mb-1.5">Damaged Items</p>
                  <ul className="space-y-1 text-sm">
                    {selectedClaim.damagedItems?.map((item, i) => (
                      <li key={i} className="flex justify-between text-slate-800">
                        <span>{item.itemName}</span>
                        <span className="font-semibold">${item.estimatedCost}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence Photos & Invoice */}
                <div className="border-t border-slate-100 pt-3 space-y-2.5">
                  <p className="font-semibold text-xs uppercase text-slate-500">Submitted Evidence</p>
                  {selectedClaim.evidencePhotos?.length > 0 ? (
                    selectedClaim.evidencePhotos.map((url, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 overflow-hidden">
                        <img
                          src={url}
                          alt="Damage evidence"
                          className="w-full h-36 object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-sky-600 bg-slate-50 hover:bg-slate-100"
                        >
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" /> Open Damage Photo #{idx + 1}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No photo attached.</p>
                  )}

                  {selectedClaim.repairInvoiceUrl && (
                    <a
                      href={selectedClaim.repairInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800"
                    >
                      <span className="flex items-center gap-2 text-rose-600">
                        <FileText className="w-4 h-4" /> View Repair Quote / Invoice PDF
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                  )}
                </div>

                {/* Adjudication Controls */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Approved Gross Amount ($)
                    </label>
                    <input
                      type="number"
                      value={approvedGross}
                      onChange={(e) => setApprovedGross(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Adjuster Notes</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAdjudicate('Approved')}
                      disabled={submitting}
                      className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Payout
                    </button>
                    <button
                      onClick={() => handleAdjudicate('Rejected')}
                      disabled={submitting}
                      className="flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                    >
                      <XCircle className="w-4 h-4" /> Reject Claim
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USERS & ROLE MANAGEMENT (Sirf super_admin ke liye) */}
      {isSuperAdmin && activeTab === 'users' && overview && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overview.users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{u.fullName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white"
                    >
                      <option value="host">Host</option>
                      <option value="adjuster">Adjuster</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}