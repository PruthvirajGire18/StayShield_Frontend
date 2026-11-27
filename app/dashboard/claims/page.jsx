'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, FileText, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [eligiblePolicies, setEligiblePolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    policyId: '',
    incidentDate: '',
    guestReservationCode: '',
    description: '',
    repairInvoiceUrl: '',
    repairInvoiceName: '',
    evidencePhotos: [],
    damagedItems: [{ itemName: '', category: 'Furniture', estimatedCost: '' }],
  });

  const loadData = async () => {
    try {
      const [claimsRes, polRes] = await Promise.all([api.get('/claims'), api.get('/policies')]);
      setClaims(claimsRes.data.data);
      const valid = polRes.data.data.policies.filter((p) => ['Active', 'Completed'].includes(p.status));
      setEligiblePolicies(valid);
      if (valid.length > 0 && !form.policyId) {
        setForm((prev) => ({ ...prev, policyId: valid[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addItemRow = () => {
    setForm({
      ...form,
      damagedItems: [...form.damagedItems, { itemName: '', category: 'Furniture', estimatedCost: '' }],
    });
  };

  const removeItemRow = (idx) => {
    if (form.damagedItems.length === 1) return;
    setForm({
      ...form,
      damagedItems: form.damagedItems.filter((_, i) => i !== idx),
    });
  };

  const updateItem = (idx, field, value) => {
    const updated = [...form.damagedItems];
    updated[idx][field] = value;
    setForm({ ...form, damagedItems: updated });
  };

  // Upload multiple damage photos to Cloudinary
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');
    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrls = (res.data.data || []).map((item) => item.url);
      setForm((prev) => ({
        ...prev,
        evidencePhotos: [...prev.evidencePhotos, ...uploadedUrls],
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload damage photos');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const removePhoto = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      evidencePhotos: prev.evidencePhotos.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Upload repair invoice PDF/image to Cloudinary
  const handleInvoiceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadingInvoice(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploaded = res.data.data?.[0];
      if (uploaded) {
        setForm((prev) => ({
          ...prev,
          repairInvoiceUrl: uploaded.url,
          repairInvoiceName: uploaded.originalName || file.name,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload repair invoice');
    } finally {
      setUploadingInvoice(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        policyId: form.policyId,
        incidentDate: form.incidentDate,
        guestReservationCode: form.guestReservationCode,
        description: form.description,
        repairInvoiceUrl: form.repairInvoiceUrl,
        evidencePhotos: form.evidencePhotos,
        damagedItems: form.damagedItems.map((i) => ({
          ...i,
          estimatedCost: Number(i.estimatedCost),
        })),
      };

      await api.post('/claims', payload);
      setShowForm(false);
      setForm({
        policyId: eligiblePolicies[0]?._id || '',
        incidentDate: '',
        guestReservationCode: '',
        description: '',
        repairInvoiceUrl: '',
        repairInvoiceName: '',
        evidencePhotos: [],
        damagedItems: [{ itemName: '', category: 'Furniture', estimatedCost: '' }],
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    if (status === 'Approved' || status === 'Paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Damage Claims Center</h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Submit accidental guest damage reports within 72 hours of check-out.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Close Form' : 'File New Claim'}
        </button>
      </div>

      {/* Claim Submission Wizard */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <h2 className="mb-5 text-lg font-bold tracking-tight text-slate-950">New Damage Claim Report</h2>

          {eligiblePolicies.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              You need at least one <strong>Active</strong> policy to file a claim. Go to{' '}
              <strong>Policy Ledger</strong> and click &quot;Activate&quot; on a scheduled stay first.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Select Active Policy</label>
                  <select
                    required
                    value={form.policyId}
                    onChange={(e) => setForm({ ...form, policyId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  >
                    {eligiblePolicies.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.policyNumber} · {p.propertyId?.title} (${p.coverageLimit} cap)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Incident Date</label>
                  <input
                    type="date"
                    required
                    value={form.incidentDate}
                    onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Booking Confirmation Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HM9X4K2P"
                    value={form.guestReservationCode}
                    onChange={(e) => setForm({ ...form, guestReservationCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              {/* Itemized Damaged Assets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800">Damaged Items & Repair Estimates</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    + Add Another Item
                  </button>
                </div>

                {form.damagedItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <input
                      type="text"
                      required
                      placeholder="Item name (e.g. 55-inch Smart TV)"
                      value={item.itemName}
                      onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:col-span-6"
                    />
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(idx, 'category', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:col-span-3"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Glass_Fixtures">Glass / Fixtures</option>
                      <option value="Linens_Decor">Linens / Decor</option>
                      <option value="Structural">Structural</option>
                    </select>
                    <input
                      type="number"
                      min={1}
                      required
                      placeholder="Cost ($)"
                      value={item.estimatedCost}
                      onChange={(e) => updateItem(idx, 'estimatedCost', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:col-span-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="flex min-h-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 sm:col-span-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Incident Description</label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  placeholder="Describe how the accidental damage occurred during the guest's stay..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm shadow-sm transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              {/* Direct Cloudinary File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Damage Photos Upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Damage Photos (Evidence)
                  </label>
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-4 text-center cursor-pointer transition hover:border-emerald-500 hover:bg-emerald-50/30">
                    {uploadingPhotos ? (
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading photos...
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-500 mb-1" />
                        <span className="text-xs font-semibold text-slate-700">
                          Click to upload damage photos
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          JPG, PNG, WEBP (Max 10MB each)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploadingPhotos}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {form.evidencePhotos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {form.evidencePhotos.map((url, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-20 object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 rounded-full bg-slate-900/75 p-1 text-white hover:bg-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Repair Invoice PDF Upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Repair Quote / Invoice (PDF or Image)
                  </label>
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-4 text-center cursor-pointer transition hover:border-emerald-500 hover:bg-emerald-50/30">
                    {uploadingInvoice ? (
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading invoice...
                      </div>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 text-slate-500 mb-1" />
                        <span className="text-xs font-semibold text-slate-700">
                          Click to upload repair invoice
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          PDF, JPG, PNG (Max 10MB)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      disabled={uploadingInvoice}
                      onChange={handleInvoiceUpload}
                      className="hidden"
                    />
                  </label>

                  {form.repairInvoiceUrl && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs">
                      <a
                        href={form.repairInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-semibold text-emerald-800 truncate"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">{form.repairInvoiceName || 'Uploaded Invoice'}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, repairInvoiceUrl: '', repairInvoiceName: '' })}
                        className="text-slate-500 hover:text-rose-600 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || uploadingPhotos || uploadingInvoice}
                className="min-h-11 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0 disabled:opacity-50"
              >
                {loading ? 'Submitting Claim...' : 'Submit Claim for Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Host Claims History List */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <th className="py-3.5 px-4">Claim #</th>
              <th className="py-3.5 px-4">Property / Policy</th>
              <th className="py-3.5 px-4">Items Damaged</th>
              <th className="py-3.5 px-4">Claimed</th>
              <th className="py-3.5 px-4">Approved Payout</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {claims.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No damage claims filed yet.
                </td>
              </tr>
            ) : (
              claims.map((clm) => (
                <tr key={clm._id} className="transition-colors hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{clm.claimNumber}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{clm.propertyId?.title}</div>
                    <div className="text-xs text-slate-500">{clm.policyId?.policyNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {clm.damagedItems?.map((i) => i.itemName).join(', ')}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">${clm.totalClaimedAmount}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    {clm.approvedPayoutAmount > 0 ? `$${clm.approvedPayoutAmount}` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadge(clm.status)}`}>
                      {clm.status}
                    </span>
                    {clm.adjusterNotes && (
                      <p className="text-xs text-slate-500 mt-1">Note: {clm.adjusterNotes}</p>
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