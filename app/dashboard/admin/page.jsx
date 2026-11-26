'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Building2,
  RefreshCw,
  Search,
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminWorkbenchPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [claims, setClaims] = useState([]);
  const [overview, setOverview] = useState(null);
  const [properties, setProperties] = useState([]);
  const [policies, setPolicies] = useState([]);

  const [activeTab, setActiveTab] = useState('claims');
  const [claimFilter, setClaimFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [approvedGross, setApprovedGross] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

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

    if (role === 'super_admin') {
      try {
        const [ovRes, propRes, polRes] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/properties'),
          api.get('/admin/policies'),
        ]);
        setOverview(ovRes.data.data);
        setProperties(propRes.data.data || []);
        setPolicies(polRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setOverview(null);
      setActiveTab('claims');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('stayshield_token');
    const saved = localStorage.getItem('stayshield_user');
    const parsed = saved ? JSON.parse(saved) : null;

    // 1. Not logged in -> redirect to login
    if (!token || !parsed) {
      router.replace('/login');
      return;
    }

    // 2. Host or unauthorized role -> redirect to host dashboard
    if (!['super_admin', 'adjuster'].includes(parsed.role)) {
      router.replace('/dashboard');
      return;
    }

    setCurrentUser(parsed);
    setAuthChecked(true);
    fetchData(parsed.role);
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
      </div>
    );
  }

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

  const handlePropertyAction = async (propertyId, payload) => {
    setSyncingId(propertyId);
    try {
      await api.patch(`/admin/properties/${propertyId}`, payload);
      await fetchData(currentUser?.role);
    } catch (err) {
      alert(err.response?.data?.message || 'Property action failed');
    } finally {
      setSyncingId(null);
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const filteredClaims = claims.filter((c) => {
    const matchesStatus = claimFilter === 'ALL' || c.status === claimFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.claimNumber?.toLowerCase().includes(q) ||
      c.propertyId?.title?.toLowerCase().includes(q) ||
      c.hostId?.fullName?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSuperAdmin ? 'Super Admin & Underwriting Console' : 'Claims Adjudication Workbench'}
          </h1>
          <p className="text-sm text-slate-500">
            {isSuperAdmin
              ? 'Adjudicate damage claims, monitor iCal feeds, audit policies, and manage user roles.'
              : 'Review submitted guest damage claims, inspect evidence, and approve payouts.'}
          </p>
        </div>

        {isSuperAdmin && overview && (
          <div className="flex flex-wrap bg-white p-1 rounded-xl border border-slate-200 shadow-sm gap-1">
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'claims' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Claims ({claims.length})
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'properties' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'policies' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Policies ({policies.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users ({overview.users.length})
            </button>
          </div>
        )}
      </div>

      {/* Super Admin Platform KPIs */}
      {isSuperAdmin && overview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{overview.stats.totalUsers}</p>
            </div>
            <Users className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Properties</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{overview.stats.totalProperties}</p>
            </div>
            <Building2 className="w-7 h-7 text-sky-600" />
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
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'Submitted', 'Under_Review', 'Approved', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setClaimFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    claimFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search claim #, host, property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

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
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No matching claims found.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((clm) => (
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
        </div>
      )}

      {/* TAB 2: PROPERTIES & ICAL MONITORING */}
      {isSuperAdmin && activeTab === 'properties' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3.5 px-4">Property</th>
                <th className="py-3.5 px-4">Host</th>
                <th className="py-3.5 px-4">Tier & Rate</th>
                <th className="py-3.5 px-4">iCal Feeds</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No properties onboarded yet.
                  </td>
                </tr>
              ) : (
                properties.map((prop) => {
                  const primaryFeed = prop.calendarFeeds?.[0];
                  return (
                    <tr key={prop._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{prop.title}</div>
                        <div className="text-xs text-slate-500">
                          {prop.propertyType} · {prop.address?.city}, {prop.address?.state}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{prop.hostId?.fullName || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{prop.hostId?.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-semibold text-slate-900">{prop.coverageTier}</div>
                        <div className="text-slate-500">${prop.baseNightlyRate}/night</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {primaryFeed ? (
                          <div>
                            <span
                              className={`font-semibold ${
                                primaryFeed.syncStatus === 'Healthy' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {primaryFeed.platform} ({primaryFeed.syncStatus})
                            </span>
                            <div className="text-slate-400">
                              {primaryFeed.lastSyncedAt
                                ? new Date(primaryFeed.lastSyncedAt).toLocaleString()
                                : 'Pending sync'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">No feed linked</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            prop.status === 'Active_Monitoring'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handlePropertyAction(prop._id, { triggerSync: true })}
                          disabled={syncingId === prop._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === prop._id ? 'animate-spin' : ''}`} />
                          Sync
                        </button>
                        <button
                          onClick={() =>
                            handlePropertyAction(prop._id, {
                              status: prop.status === 'Active_Monitoring' ? 'Paused' : 'Active_Monitoring',
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                        >
                          {prop.status === 'Active_Monitoring' ? 'Pause' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: POLICIES LEDGER */}
      {isSuperAdmin && activeTab === 'policies' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3.5 px-4">Policy #</th>
                <th className="py-3.5 px-4">Property & Host</th>
                <th className="py-3.5 px-4">Stay Window</th>
                <th className="py-3.5 px-4">Tier & Limit</th>
                <th className="py-3.5 px-4">Premium</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No policies issued yet.
                  </td>
                </tr>
              ) : (
                policies.map((pol) => (
                  <tr key={pol._id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{pol.policyNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{pol.propertyId?.title}</div>
                      <div className="text-xs text-slate-500">{pol.hostId?.fullName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>
                        {new Date(pol.checkInDate).toLocaleDateString()} →{' '}
                        {new Date(pol.checkOutDate).toLocaleDateString()}
                      </div>
                      <div className="text-slate-400">{pol.totalNights} nights</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-900">{pol.coverageTier}</div>
                      <div className="text-slate-500">Cap: ${pol.coverageLimit?.toLocaleString()}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      ${pol.totalPremium} <span className="text-xs font-normal text-slate-400">{pol.currency}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          pol.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pol.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: USERS & ROLE MANAGEMENT */}
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