'use client';

import { useState } from 'react';
import {
  Truck,
  Plane,
  Ship,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  LogOut,
  ExternalLink,
  Filter,
  ArrowRight,
  ShieldAlert,
  Edit,
  Save,
  MessageSquare
} from 'lucide-react';
import { getAuthUser, clearAuthUser } from '../../lib/auth';

type ShipmentItem = {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientPhone: string;
  destination: string;
  origin: string;
  mode: 'air' | 'sea';
  status:
    | 'Order approved'
    | 'Sourced in China'
    | 'Arrived at warehouse'
    | 'Cargo flight booked'
    | 'Customs clearing Lagos'
    | 'Ready for pickup'
    | 'Delivered';
  weight: number;
  description: string;
  estimatedArrival: string;
  lastUpdated: string;
  staffNotes: string;
};

const INITIAL_STAFF_SHIPMENTS: ShipmentItem[] = [
  {
    id: 's-1',
    trackingNumber: 'BSP-NG-88219',
    clientName: 'Chief Emeka Okafor',
    clientPhone: '0803 456 7890',
    origin: 'Guangzhou, China',
    destination: 'Egbeda / Trade Fair, Lagos',
    mode: 'air',
    status: 'Customs clearing Lagos',
    weight: 120,
    description: 'Commercial Blenders & High-Speed Juicers (50 Cartons)',
    estimatedArrival: '2026-11-24',
    lastUpdated: 'Today at 10:15 AM',
    staffNotes: 'Cargo landed at Murtala Muhammed Cargo Airport. Clearing agent processing final terminal release.',
  },
  {
    id: 's-2',
    trackingNumber: 'BSP-NG-90412',
    clientName: 'Amina Bello (Bella Glow)',
    clientPhone: '0812 987 6543',
    origin: 'Hanoi, Vietnam',
    destination: 'Victoria Island, Lagos',
    mode: 'air',
    status: 'Cargo flight booked',
    weight: 35,
    description: 'Virgin Vietnamese Human Hair Bundles & HD Closures',
    estimatedArrival: '2026-11-26',
    lastUpdated: 'Yesterday at 4:30 PM',
    staffNotes: 'Packed in waterproof crates. Flight flight manifest confirmed with Qatar Airways Cargo.',
  },
  {
    id: 's-3',
    trackingNumber: 'BSP-NG-77301',
    clientName: 'Tunde Adeleke (Skyline Retail)',
    clientPhone: '0802 111 2233',
    origin: 'Ningbo Port, China',
    destination: 'Tin Can Island Port, Lagos',
    mode: 'sea',
    status: 'Sourced in China',
    weight: 650,
    description: 'Solar Inverters & Lithium Battery Storage Systems',
    estimatedArrival: '2026-12-18',
    lastUpdated: 'Nov 20, 2026',
    staffNotes: 'Goods verified at factory. Sea container booking confirmed with Maersk Line.',
  },
];

export function StaffDashboard() {
  const [user] = useState(getAuthUser());
  const [shipments, setShipments] = useState<ShipmentItem[]>(INITIAL_STAFF_SHIPMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedShipment, setSelectedShipment] = useState<ShipmentItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentItem['status']>('Order approved');
  const [newNote, setNewNote] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignOut = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  const filtered = shipments.filter((s) => {
    const matchSearch =
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.clientName.toLowerCase().includes(search.toLowerCase()) ||
      s.clientPhone.includes(search);
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApplyUpdate = () => {
    if (!selectedShipment) return;
    const updatedList = shipments.map((s) => {
      if (s.id === selectedShipment.id) {
        return {
          ...s,
          status: newStatus,
          staffNotes: newNote || s.staffNotes,
          lastUpdated: 'Just now by Staff',
        };
      }
      return s;
    });
    setShipments(updatedList);
    setIsUpdating(false);
    setSelectedShipment(null);
    setSuccessMsg('Shipment updated successfully! Live tracking updated for client.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#ECE8DF] bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#FAFAF8] p-1.5 border border-[#ECE8DF] flex items-center justify-center">
              <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Sora', sans-serif" }} className="text-lg font-extrabold tracking-[-0.02em]">
                  BuySmart
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#C9A227]/20 text-[#6B5515] text-[10px] font-bold uppercase tracking-wider">
                  Staff Operations Desk
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#66615B]">
                Worker Cargo Intake & Milestone Management
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-semibold text-[#4A4A4A] bg-[#FAFAF8] px-3.5 py-1.5 rounded-full border border-[#ECE8DF]">
              Staff: {user?.name || 'Logistics Officer'}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] hover:bg-red-50 px-3.5 py-2 rounded-full border border-red-200 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-xs font-semibold text-green-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Staff Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#ECE8DF] shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#C9A227]/15 flex items-center justify-center text-[#C9A227]">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-[#66615B] font-bold uppercase">Active Shipments</span>
              <div className="text-xl font-extrabold text-[#111111]">{shipments.length} Cargo Lots</div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#ECE8DF] shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Plane className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-[#66615B] font-bold uppercase">Air Freight Lots</span>
              <div className="text-xl font-extrabold text-[#111111]">
                {shipments.filter((s) => s.mode === 'air').length} Shipments
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#ECE8DF] shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Ship className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-[#66615B] font-bold uppercase">Sea Freight Lots</span>
              <div className="text-xl font-extrabold text-[#111111]">
                {shipments.filter((s) => s.mode === 'sea').length} Container Lots
              </div>
            </div>
          </div>
        </div>

        {/* Shipment Operations Table */}
        <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl font-extrabold text-[#111111]">
                Package & Cargo Workflow
              </h2>
              <p className="text-xs text-[#66615B]">
                Staff worker portal to update shipment status milestones and log airport/port clearance events.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#66615B]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tracking # or client..."
                  className="pl-8 pr-3 py-2 rounded-xl border border-[#DED9CF] text-xs bg-[#FAFAF8] outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#DED9CF] text-xs bg-[#FAFAF8] outline-none font-medium"
              >
                <option value="ALL">All Milestones</option>
                <option value="Order approved">Order approved</option>
                <option value="Sourced in China">Sourced in China</option>
                <option value="Cargo flight booked">Cargo flight booked</option>
                <option value="Customs clearing Lagos">Customs clearing Lagos</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#ECE8DF] text-[#66615B] uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Tracking #</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Route & Mode</th>
                  <th className="py-3 px-3">Weight</th>
                  <th className="py-3 px-3">Current Status</th>
                  <th className="py-3 px-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8DF]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAFAF8] transition">
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-[#111111]">{item.trackingNumber}</div>
                      <div className="text-[10px] text-[#66615B]">{item.description}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#111111]">{item.clientName}</div>
                      <div className="text-[11px] text-[#66615B]">{item.clientPhone}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-semibold text-[#111111]">
                        {item.mode === 'air' ? <Plane className="h-3.5 w-3.5 text-[#C9A227]" /> : <Ship className="h-3.5 w-3.5 text-[#C9A227]" />}
                        <span>{item.origin} → {item.destination}</span>
                      </div>
                      <div className="text-[11px] text-[#66615B]">ETA: {item.estimatedArrival}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#111111]">{item.weight} KG</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C9A227]/15 text-[#6B5515]">
                        {item.status}
                      </span>
                      <div className="text-[10px] text-[#66615B] mt-1">{item.lastUpdated}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedShipment(item);
                          setNewStatus(item.status);
                          setNewNote(item.staffNotes);
                          setIsUpdating(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#C9A227] bg-[#C9A227]/10 text-[#6B5515] font-bold text-xs hover:bg-[#C9A227] hover:text-white transition cursor-pointer"
                      >
                        Update Milestone
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Update Milestone Modal */}
      {isUpdating && selectedShipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE8DF]">
              <div>
                <h3 className="text-base font-extrabold text-[#111111]">
                  Update Milestone for {selectedShipment.trackingNumber}
                </h3>
                <p className="text-xs text-[#66615B]">Client: {selectedShipment.clientName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdating(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#111111] block mb-1.5 uppercase">New Milestone Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-[#DED9CF] p-3 text-xs font-semibold outline-none focus:border-[#C9A227]"
                >
                  <option value="Order approved">1. Order approved by BuySmart</option>
                  <option value="Sourced in China">2. Sourced in China / Vietnam Factory</option>
                  <option value="Arrived at warehouse">3. Arrived at Guangzhou Warehouse</option>
                  <option value="Cargo flight booked">4. Cargo flight / Vessel Booked</option>
                  <option value="Customs clearing Lagos">5. Customs Clearing at Lagos Terminal</option>
                  <option value="Ready for pickup">6. Ready for Client Pickup / Delivery</option>
                  <option value="Delivered">7. Delivered & Signed by Client</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111111] block mb-1.5 uppercase">Staff Operations Log / Note</label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Package inspected at warehouse, customs clearance duty finalized at Lagos airport..."
                  className="w-full rounded-xl border border-[#DED9CF] p-3 text-xs outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#ECE8DF]">
              <button
                type="button"
                onClick={() => setIsUpdating(false)}
                className="px-4 py-2.5 rounded-full border border-[#DED9CF] text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApplyUpdate}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#111111' }}
              >
                Apply & Notify Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
