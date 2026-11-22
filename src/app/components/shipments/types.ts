/**
 * Shipment domain types for BuySmart.
 *
 * A shipment is linked to one invoice and one client. One invoice can have several
 * shipments (split deliveries), and a shipment can list its items so partial
 * movement works (for example 3 of 5 items have left China).
 */

export type ShipmentStatus =
  | 'Order approved'
  | 'Supplier paid'
  | 'At China warehouse'
  | 'Inspected'
  | 'Packed'
  | 'Left origin'
  | 'In transit'
  | 'Arrived in Lagos'
  | 'Customs clearing'
  | 'Customs cleared'
  | 'Out for delivery'
  | 'Delivered'
  | 'Delayed'
  | 'Held at customs'
  | 'Issue reported';

export type ExceptionStatus = 'Delayed' | 'Held at customs' | 'Issue reported';

export type ShippingMode = 'air' | 'sea';

export type ShipmentItem = {
  item_id?: string;
  shipment_id?: string;
  name: string;
  quantity_total: number;
  quantity_shipped: number;
  status?: string;
};

export type ShipmentUpdate = {
  update_id?: string;
  shipment_id: string;
  status: ShipmentStatus;
  location: string;
  note: string;
  internal_note: string;
  is_client_visible: boolean;
  photos: Attachment[];
  documents: Attachment[];
  eta_changed: boolean;
  eta_new: string;
  eta_reason: string;
  created_by: string;
  created_at: string;
};

export type Attachment = {
  url: string;
  name: string;
  mime_type: string;
};

export type Shipment = {
  shipment_id: string;
  tracking_id: string;
  invoice_number: string;
  client_name: string;
  client_phone: string;
  client_whatsapp: string;
  client_email: string;
  mode: ShippingMode;
  carrier: string;
  awb_bl: string;
  weight_kg: number;
  cbm: number;
  packages: number;
  eta: string;
  eta_reason: string;
  status: ShipmentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  items?: ShipmentItem[];
  updates?: ShipmentUpdate[];
  last_update?: ShipmentUpdate & { created_at: string };
};

export type ShipmentListItem = {
  shipment_id: string;
  tracking_id: string;
  invoice_number: string;
  client_name: string;
  client_phone: string;
  client_whatsapp: string;
  mode: ShippingMode;
  carrier: string;
  awb_bl: string;
  weight_kg: number;
  cbm: number;
  packages: number;
  eta: string;
  eta_reason: string;
  status: ShipmentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_update?: ShipmentUpdate & { created_at: string };
};

export type ClientNotificationPref = 'WhatsApp' | 'Email' | 'Both' | 'None';

export const DEFAULT_STATUSES: ShipmentStatus[] = [
  'Order approved',
  'Supplier paid',
  'At China warehouse',
  'Inspected',
  'Packed',
  'Left origin',
  'In transit',
  'Arrived in Lagos',
  'Customs clearing',
  'Customs cleared',
  'Out for delivery',
  'Delivered',
];

export const EXCEPTION_STATUSES: ExceptionStatus[] = [
  'Delayed',
  'Held at customs',
  'Issue reported',
];

export const STATUS_PROGRESS: Record<ShipmentStatus, number> = {
  'Order approved': 0,
  'Supplier paid': 1,
  'At China warehouse': 2,
  'Inspected': 3,
  'Packed': 4,
  'Left origin': 5,
  'In transit': 6,
  'Arrived in Lagos': 7,
  'Customs clearing': 8,
  'Customs cleared': 9,
  'Out for delivery': 10,
  'Delivered': 11,
  'Delayed': 0,
  'Held at customs': 0,
  'Issue reported': 0,
};
