'use client';

import React from 'react';
import {
  Package,
  Plane,
  Truck,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { type ShipmentItem } from '../../lib/auth';

interface ModernTrackingCardProps {
  shipment: ShipmentItem;
  onUpdateMilestone?: () => void;
  isAdmin?: boolean;
}

export function ModernTrackingCard({ shipment, onUpdateMilestone, isAdmin }: ModernTrackingCardProps) {
  // Determine high-level stage based on shipment status
  const isDelivered = shipment.status === 'Delivered';
  const isInTransit =
    shipment.status === 'Cargo flight booked' ||
    shipment.status === 'Arrived at warehouse' ||
    shipment.status === 'Customs clearing Lagos';
  const isSourced = shipment.status === 'Sourced in China' || shipment.status === 'Order approved';

  return (
    <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition space-y-6">
      {/* Top Header: Headline + Tracking Meta */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C9A227]/15 text-[#6B5515] text-[10px] font-bold uppercase tracking-wider">
              {shipment.mode === 'air' ? 'Air Freight Priority' : 'Sea Freight Container'}
            </span>
            <span className="text-xs font-mono font-bold text-[#8C827A]">{shipment.trackingNumber}</span>
          </div>

          <h2
            style={{ fontFamily: "'Sora', sans-serif" }}
            className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-[-0.02em]"
          >
            {isDelivered ? 'Delivered' : isInTransit ? 'On the way' : 'Order Processing'}
          </h2>
          <p className="text-xs sm:text-sm text-[#66615B] mt-0.5">
            {isDelivered
              ? 'Your cargo has been safely delivered to destination.'
              : isInTransit
              ? 'Your cargo is in active transit to Lagos, Nigeria.'
              : 'Procurement and verification underway at Guangzhou factory.'}
          </p>
        </div>

        {/* Estimated Arrival Hero Card (Inspired by User Screenshot) */}
        <div className="rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] p-4 text-left sm:text-right min-w-[160px]">
          <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
            Estimated Arrival
          </span>
          <div
            style={{ fontFamily: "'Sora', sans-serif" }}
            className="text-xl sm:text-2xl font-black text-[#111111] mt-0.5"
          >
            {shipment.estimatedArrival}
          </div>
          <span className="text-[10px] text-[#C9A227] font-semibold flex items-center sm:justify-end gap-1 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A227] animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      {/* Signature Modern Pill Progress Capsule (Inspired by Image 1) */}
      <div className="rounded-full bg-[#18181B] p-3 sm:p-4 text-white shadow-inner flex items-center justify-between relative overflow-hidden">
        {/* Glow track under active nodes */}
        <div
          className="absolute left-6 h-2 rounded-full bg-gradient-to-r from-[#C9A227] via-[#D4AF37] to-[#84CC16] transition-all duration-700"
          style={{ width: `calc(${Math.min(92, Math.max(15, shipment.progressPercent))}% - 12px)` }}
        />

        {/* Node 1: Sourced in Factory */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition shadow-md ${
              shipment.progressPercent >= 20
                ? 'bg-[#D4AF37] text-[#111111] ring-4 ring-[#D4AF37]/30'
                : 'bg-[#27272A] text-[#71717A]'
            }`}
          >
            <Package className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>

        {/* Node 2: Transit / Cargo Flight or Sea */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition shadow-md ${
              shipment.progressPercent >= 50
                ? 'bg-[#84CC16] text-[#111111] ring-4 ring-[#84CC16]/30'
                : 'bg-[#27272A] text-[#71717A]'
            }`}
          >
            {shipment.mode === 'air' ? (
              <Plane className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </div>
        </div>

        {/* Node 3: Lagos Port / Final Delivery */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition shadow-md ${
              shipment.progressPercent >= 90
                ? 'bg-[#10B981] text-white ring-4 ring-[#10B981]/30'
                : 'bg-[#27272A] text-[#71717A]'
            }`}
          >
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </div>

      {/* Cargo Meta Grid (Weight, Route, Active Location, Items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-[#FAFAF8] p-4 rounded-2xl border border-[#ECE8DF]">
        <div>
          <span className="text-[#8C827A] font-bold text-[10px] uppercase">Cargo Description</span>
          <p className="font-bold text-[#111111] truncate">{shipment.description}</p>
        </div>
        <div>
          <span className="text-[#8C827A] font-bold text-[10px] uppercase">Route</span>
          <p className="font-bold text-[#111111]">
            {shipment.origin} → {shipment.destination}
          </p>
        </div>
        <div>
          <span className="text-[#8C827A] font-bold text-[10px] uppercase">Verified Weight</span>
          <p className="font-bold text-[#111111]">{shipment.weight} KG (Air/Sea Scaled)</p>
        </div>
        <div>
          <span className="text-[#8C827A] font-bold text-[10px] uppercase flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#C9A227]" />
            Active Location
          </span>
          <p className="font-bold text-[#111111] truncate">
            {shipment.currentLocation || 'Guangzhou International Logistics Hub'}
          </p>
        </div>
      </div>

      {/* Enterprise Horizontal Milestone Timeline (Inspired by Image 2) */}
      <div className="pt-2">
        <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider block mb-3">
          Detailed Milestone Stages ({shipment.progressPercent}% Complete)
        </span>

        <div className="relative flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-2">
          {shipment.stages.map((stage, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center text-center min-w-[80px]">
              {/* Date above node */}
              <span className="text-[10px] font-semibold text-[#8C827A] mb-1">
                {stage.date || `Step ${idx + 1}`}
              </span>

              {/* Node Circle */}
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm ${
                  stage.done
                    ? 'bg-[#C9A227] text-white ring-2 ring-[#C9A227]/25'
                    : 'bg-[#ECE8DF] text-[#8C827A]'
                }`}
              >
                {stage.done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>

              {/* Title below node */}
              <span
                className={`text-[10px] mt-1.5 font-bold line-clamp-2 ${
                  stage.done ? 'text-[#111111]' : 'text-[#8C827A]'
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Operational Note & Admin Update Trigger */}
      <div className="pt-3 border-t border-[#ECE8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-[#66615B]">
          Latest Update:{' '}
          <span className="font-semibold text-[#111111]">
            {shipment.staffNotes || 'Cargo landed at Lagos Airport. Clearing agent processing customs release.'}
          </span>
        </div>

        {isAdmin && onUpdateMilestone && (
          <button
            type="button"
            onClick={onUpdateMilestone}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#111111] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer self-start sm:self-auto"
          >
            <span>Update Milestone</span>
          </button>
        )}
      </div>
    </div>
  );
}
