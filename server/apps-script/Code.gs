/**
 * BuySmart Procurement Limited — Shared data backend
 * Google Apps Script web app for the BuySmart invoice & receipt PWA.
 *
 * Sheets (tabs) used by this script:
 *   shipments, shipment_items, shipment_updates, clients, audit_log, lockouts
 *
 * Script Properties (Apps Script editor → Project settings → Script properties):
 *   STAFF_PASSPHRASE  - staff: create invoices, update shipments, reply to quotes
 *   ADMIN_PASSPHRASE  - admin: everything staff can do, plus profit, reports, settings
 *   DRIVE_FOLDER_ID   - optional ID of the Drive folder that stores photos/documents
 *
 * Deploy as a web app: Execute as "Me", Who has access: "Anyone".
 * Add a time-driven trigger for createWeeklyBackup (weekly) for automatic backups.
 */

const SHEETS = {
  SHIPMENTS: 'shipments',
  SHIPMENT_ITEMS: 'shipment_items',
  SHIPMENT_UPDATES: 'shipment_updates',
  CLIENTS: 'clients',
  AUDIT_LOG: 'audit_log',
  LOCKOUTS: 'lockouts',
};

const MAX_WRONG_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

const DEFAULT_STATUSES = [
  'Order approved', 'Supplier paid', 'At China warehouse', 'Inspected', 'Packed',
  'Left origin', 'In transit', 'Arrived in Lagos', 'Customs clearing',
  'Customs cleared', 'Out for delivery', 'Delivered',
];

const EXCEPTION_STATUSES = ['Delayed', 'Held at customs', 'Issue reported'];

const STATUS_PROGRESS = {
  'Order approved': 0, 'Supplier paid': 1, 'At China warehouse': 2, 'Inspected': 3,
  'Packed': 4, 'Left origin': 5, 'In transit': 6, 'Arrived in Lagos': 7,
  'Customs clearing': 8, 'Customs cleared': 9, 'Out for delivery': 10, 'Delivered': 11,
};

function getProp(key, fallback) {
  try {
    const value = PropertiesService.getScriptProperties().getProperty(key);
    return value !== null ? value : fallback;
  } catch (error) {
    return fallback;
  }
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(name, headers) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }
  return sheet;
}

function ensureSheets() {
  getOrCreateSheet(SHEETS.SHIPMENTS, [
    'shipment_id', 'tracking_id', 'invoice_number', 'client_name', 'client_phone',
    'client_whatsapp', 'client_email', 'mode', 'carrier', 'awb_bl', 'weight_kg',
    'cbm', 'packages', 'eta', 'eta_reason', 'status', 'created_by', 'created_at', 'updated_at',
  ]);
  getOrCreateSheet(SHEETS.SHIPMENT_ITEMS, [
    'item_id', 'shipment_id', 'name', 'quantity_total', 'quantity_shipped', 'status',
  ]);
  getOrCreateSheet(SHEETS.SHIPMENT_UPDATES, [
    'update_id', 'shipment_id', 'status', 'location', 'note', 'internal_note',
    'is_client_visible', 'photos', 'documents', 'eta_changed', 'eta_new', 'eta_reason',
    'created_by', 'created_at', 'occurred_at',
  ]);
  getOrCreateSheet(SHEETS.CLIENTS, [
    'client_id', 'name', 'phone', 'whatsapp', 'email', 'notification_pref',
    'balance_kobo', 'internal_notes', 'created_at',
  ]);
  getOrCreateSheet(SHEETS.AUDIT_LOG, [
    'log_id', 'actor', 'role', 'action', 'target_type', 'target_id', 'details', 'created_at',
  ]);
  getOrCreateSheet(SHEETS.LOCKOUTS, [
    'lock_id', 'actor', 'wrong_at', 'locked_until',
  ]);
function logAction(actor, role, action, targetType, targetId, details) {
  try {
    ensureSheets();
    const sheet = getSpreadsheet().getSheetByName(SHEETS.AUDIT_LOG);
    appendRows(sheet, [[
      Utilities.getUuid(), actor || 'staff', role || 'staff', action,
      targetType || '', targetId || '', JSON.stringify(details || {}), isoNow(),
    ]]);
  } catch (error) {
    // Never fail the main request because of audit logging
  }
}

function recordWrongAttempt(actor) {
  try {
    ensureSheets();
    const sheet = getSpreadsheet().getSheetByName(SHEETS.LOCKOUTS);
    const now = new Date();
    appendRows(sheet, [[Utilities.getUuid(), actor || 'unknown', isoNow(), '']]);
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const rows = sheetRows(sheet).filter(function (r) {
      const at = new Date(r.wrong_at);
      return r.actor === (actor || 'unknown') && !isNaN(at) && at >= cutoff;
    });
    if (rows.length >= MAX_WRONG_ATTEMPTS) {
      const latest = new Date(rows[rows.length - 1].wrong_at);
      return new Date(latest.getTime() + LOCKOUT_MINUTES * 60 * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
}

function isLocked(actor) {
  try {
    ensureSheets();
    const sheet = getSpreadsheet().getSheetByName(SHEETS.LOCKOUTS);
    const rows = sheetRows(sheet).filter(function (r) { return r.actor === (actor || 'unknown'); });
    const now = new Date();
    const latest = rows.sort(function (a, b) {
      return new Date(b.wrong_at) - new Date(a.wrong_at);
    })[0];
    if (latest && latest.locked_until && new Date(latest.locked_until) > now) {
      return new Date(latest.locked_until);
    }
    return null;
  } catch (error) {
    return null;
  }
}

function authenticate(passphrase, actor) {
  const lockedUntil = isLocked(actor);
  if (lockedUntil) {
    return { ok: false, error: 'Too many wrong attempts. Please try again later.', lockedUntil: lockedUntil.toISOString() };
  }
  const staffPass = getProp('STAFF_PASSPHRASE', '');
  const adminPass = getProp('ADMIN_PASSPHRASE', '');
  if (adminPass !== '' && passphrase === adminPass) {
    return { ok: true, role: 'admin', actor };
  }
  if (staffPass !== '' && passphrase === staffPass) {
    return { ok: true, role: 'staff', actor };
  }
  const locked = recordWrongAttempt(actor);
  return {
    ok: false,
    error: locked ? 'Too many wrong attempts. Please try again later.' : 'Invalid passphrase.',
    lockedUntil: locked ? locked.toISOString() : null,
  };
}

}

function sheetRows(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function appendRows(sheet, rows) {
  if (!rows.length) return;
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function getDriveFolderId() {
  const id = getProp('DRIVE_FOLDER_ID', '');
  if (id) return id;
  let folders = DriveApp.getFoldersByName('BuySmart Uploads');
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder('BuySmart Uploads');
  }
  return folder.getId();
}

function saveAttachment(fileName, mimeType, base64Data) {
  const folderId = getDriveFolderId();
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
  const file = DriveApp.getFolderById(folderId).createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (error) {}
  return { url: file.getUrl(), name: fileName, mime_type: mimeType };
}

function trackingId() {
  ensureSheets();
  const sheet = getSpreadsheet().getSheetByName(SHEETS.SHIPMENTS);
  const rows = sheetRows(sheet);
  const seq = String(rows.length + 1).padStart(4, '0');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return 'BSP-TRK-' + seq + '-' + code;
}

function findShipmentByTracking(trackingId) {
  const sheet = getSpreadsheet().getSheetByName(SHEETS.SHIPMENTS);
  return sheetRows(sheet).find(function (r) { return r.tracking_id === trackingId; }) || null;
}

function findShipmentById(shipmentId) {
  const sheet = getSpreadsheet().getSheetByName(SHEETS.SHIPMENTS);
  return sheetRows(sheet).find(function (r) { return r.shipment_id === shipmentId; }) || null;
}

function getShipmentFull(shipmentId) {
  const shipment = findShipmentById(shipmentId);
  if (!shipment) return null;
  const updates = sheetRows(getSpreadsheet().getSheetByName(SHEETS.SHIPMENT_UPDATES))
    .filter(function (u) { return u.shipment_id === shipmentId; })
    .sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
  const items = sheetRows(getSpreadsheet().getSheetByName(SHEETS.SHIPMENT_ITEMS))
    .filter(function (i) { return i.shipment_id === shipmentId; });
  return { shipment, updates, items };
}

function listShipments() {
  const shipments = sheetRows(getSpreadsheet().getSheetByName(SHEETS.SHIPMENTS))
    .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
  const updates = sheetRows(getSpreadsheet().getSheetByName(SHEETS.SHIPMENT_UPDATES));
  return shipments.map(function (s) {
    const sUpdates = updates.filter(function (u) { return u.shipment_id === s.shipment_id; })
      .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
    return {
      shipment_id: s.shipment_id,
      tracking_id: s.tracking_id,
      invoice_number: s.invoice_number,
      client_name: s.client_name,
      client_phone: s.client_phone,
      client_whatsapp: s.client_whatsapp,
      mode: s.mode,
      carrier: s.carrier,
      awb_bl: s.awb_bl,
      weight_kg: s.weight_kg,
      cbm: s.cbm,
      packages: s.packages,
      eta: s.eta,
      eta_reason: s.eta_reason,
      status: s.status,
      created_by: s.created_by,
      created_at: s.created_at,
      updated_at: s.updated_at,
      last_update: sUpdates[0] || null,
    };
  });
}

function upsertClient(client) {
  ensureSheets();
  const sheet = getSpreadsheet().getSheetByName(SHEETS.CLIENTS);
  const rows = sheetRows(sheet);
  let clientId = client.client_id;
  if (!clientId) {
    const existing = rows.find(function (r) { return r.phone === client.phone || r.whatsapp === client.whatsapp; });
    if (existing) clientId = existing.client_id;
  }
  if (!clientId) {
    clientId = 'CLT-' + String(rows.length + 1).padStart(4, '0');
    appendRows(sheet, [[
      clientId, client.name || '', client.phone || '', client.whatsapp || '',
      client.email || '', client.notification_pref || 'WhatsApp', '0',
      client.internal_notes || '', isoNow(),
    ]]);
    return clientId;
  }
  return clientId;
}

function isoNow() {
  return new Date().toISOString();
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MIME_TYPE_JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function errorResponse(message, statusCode) {
  return jsonResponse({ ok: false, error: message }, statusCode || 400);
}

function doOptions() {
  return jsonResponse({ ok: true });
}

function doGet(e) {
  try {
    ensureSheets();
    const params = e.parameter || {};
    const action = params.action;

    if (action === 'tracking') {
      const id = params.id;
      if (!id) return errorResponse('Missing tracking id', 400);
      const shipment = findShipmentByTracking(id);
      if (!shipment) return errorResponse('Shipment not found', 404);
      const updates = sheetRows(getSpreadsheet().getSheetByName(SHEETS.SHIPMENT_UPDATES))
        .filter(function (u) { return u.shipment_id === shipment.shipment_id && u.is_client_visible === 'true'; })
        .sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
      const items = sheetRows(getSpreadsheet().getSheetByName(SHEETS.SHIPMENT_ITEMS))
        .filter(function (i) { return i.shipment_id === shipment.shipment_id; });
      return jsonResponse({
        ok: true,
        shipment: {
          tracking_id: shipment.tracking_id,
          invoice_number: shipment.invoice_number,
          client_name: shipment.client_name,
          mode: shipment.mode,
          carrier: shipment.carrier,
          awb_bl: shipment.awb_bl,
          weight_kg: shipment.weight_kg,
          cbm: shipment.cbm,
          packages: shipment.packages,
          eta: shipment.eta,
          eta_reason: shipment.eta_reason,
          status: shipment.status,
          created_at: shipment.created_at,
        },
        updates: updates.map(function (u) {
          return {
            update_id: u.update_id,
            status: u.status,
            location: u.location,
            note: u.note,
            photos: u.photos ? JSON.parse(u.photos || '[]') : [],
            documents: u.documents ? JSON.parse(u.documents || '[]') : [],
            eta_changed: u.eta_changed === 'true',
            eta_new: u.eta_new,
            eta_reason: u.eta_reason,
            created_at: u.created_at,
          };
function doPost(e) {
  try {
    ensureSheets();
    const body = typeof e.postData?.contents === 'string'
      ? JSON.parse(e.postData.contents)
      : (e.parameter || {});
    const action = body.action;
    const auth = authenticate(body.passphrase, body.actor || 'unknown');
    if (!auth.ok) return errorResponse(auth.error, 403);

    switch (action) {
      case 'createShipment': return handleCreateShipment(body, auth);
      case 'addUpdate': return handleAddUpdate(body, auth);
      case 'bulkUpdate': return handleBulkUpdate(body, auth);
      default: return errorResponse('Unknown action', 400);
    }
  } catch (error) {
    return errorResponse(error.message || 'Request failed', 500);
  }
}

function handleCreateShipment(body, auth) {
  const invoiceNumber = String(body.invoice_number || '').trim();
  const clientName = String(body.client_name || '').trim();
  if (!invoiceNumber || !clientName) {
    return errorResponse('Invoice number and client name are required.', 400);
  }

  ensureSheets();
  const clientId = upsertClient({
    name: clientName,
    phone: body.client_phone || '',
    whatsapp: body.client_whatsapp || '',
    email: body.client_email || '',
    notification_pref: body.notification_pref || 'WhatsApp',
    internal_notes: body.client_notes || '',
  });

  const shipmentId = Utilities.getUuid();
  const trackId = trackingId();
  const now = isoNow();
  const sheet = getSpreadsheet().getSheetByName(SHEETS.SHIPMENTS);
  appendRows(sheet, [[
    shipmentId, trackId, invoiceNumber, clientName, body.client_phone || '',
    body.client_whatsapp || '', body.client_email || '', body.mode || 'air',
    body.carrier || '', body.awb_bl || '', body.weight_kg || '',
    body.cbm || '', body.packages || '', body.eta || '', body.eta_reason || '',
    body.status || 'Order approved', auth.actor, now, now,
  ]]);

  (body.items || []).forEach(function (item) {
    appendRows(getSpreadsheet().getSheetByName(SHEETS.SHIPMENT_ITEMS), [[
      Utilities.getUuid(), shipmentId, String(item.name || ''),
      Number(item.quantity_total || 0), Number(item.quantity_shipped || 0),
      item.status || 'Pending',
    ]]);
  });

  appendRows(getSpreadsheet().getSheetByName(SHEETS.SHIPMENT_UPDATES), [[
    Utilities.getUuid(), shipmentId, body.status || 'Order approved',
    '', 'Shipment created and linked to invoice ' + invoiceNumber, '',
    'true', '[]', '[]', 'false', '', '', auth.actor, now,
function handleAddUpdate(body, auth) {
  const shipmentId = body.shipment_id;
  const shipment = findShipmentById(shipmentId);
  if (!shipment) return errorResponse('Shipment not found', 404);

  const status = String(body.status || '').trim();
  if (!status) return errorResponse('Status is required.', 400);
  if (EXCEPTION_STATUSES.indexOf(status) >= 0 && !String(body.note || '').trim()) {
    return errorResponse('A reason is required for ' + status + '.', 400);
  }

  const photos = (body.photos || []).map(function (p) {
    return saveAttachment(p.name || 'photo.jpg', p.mime_type || 'image/jpeg', p.data);
  });
  const documents = (body.documents || []).map(function (p) {
    return saveAttachment(p.name || 'document.pdf', p.mime_type || 'application/pdf', p.data);
  });

  const now = isoNow();
  let etaChanged = 'false';
  let etaNew = '';
  let etaReason = '';
  if (body.eta && String(body.eta).trim() !== '' && String(body.eta) !== String(shipment.eta || '')) {
    etaChanged = 'true';
    etaNew = String(body.eta);
    etaReason = String(body.eta_reason || '');
  }

  const updateId = Utilities.getUuid();
  const occurredAt = body.occurred_at || now;
  appendRows(getSpreadsheet().getSheetByName(SHEETS.SHIPMENT_UPDATES), [[
    updateId, shipmentId, status, body.location || '', body.note || '',
    body.internal_note || '', body.is_client_visible === false ? 'false' : 'true',
    JSON.stringify(photos), JSON.stringify(documents), etaChanged, etaNew, etaReason,
    auth.actor, now, occurredAt,
  ]]);

  const shipmentSheet = getSpreadsheet().getSheetByName(SHEETS.SHIPMENTS);
  const data = shipmentSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === shipmentId) {
      shipmentSheet.getRange(i + 1, 17).setValue(status);
      shipmentSheet.getRange(i + 1, 14).setValue(etaNew || shipment.eta || '');
      if (etaReason) shipmentSheet.getRange(i + 1, 15).setValue(etaReason);
      shipmentSheet.getRange(i + 1, 19).setValue(now);
      break;
    }
  }

  logAction(auth.actor, auth.role, 'addUpdate', 'shipment_update', updateId, {
    shipment_id: shipmentId, tracking_id: shipment.tracking_id, status: status,
    client_visible: body.is_client_visible !== false,
  });

  return jsonResponse({ ok: true, update_id: updateId });
}

function handleBulkUpdate(body, auth) {
  const ids = Array.isArray(body.shipment_ids) ? body.shipment_ids : [];
  const status = String(body.status || '').trim();
  const note = String(body.note || 'Bulk status update applied.');
  if (!ids.length || !status) return errorResponse('Select shipments and a status.', 400);
  if (EXCEPTION_STATUSES.indexOf(status) >= 0 && !note.trim()) {
    return errorResponse('A reason is required for ' + status + '.', 400);
  }

  ensureSheets();
  const now = isoNow();
  const results = [];
  const updateSheet = getSpreadsheet().getSheetByName(SHEETS.SHIPMENT_UPDATES);
  const shipmentSheet = getSpreadsheet().getSheetByName(SHEETS.SHIPMENTS);
  const allShipments = sheetRows(shipmentSheet);
  const data = shipmentSheet.getDataRange().getValues();

  ids.forEach(function (id) {
    const shipment = allShipments.find(function (s) { return s.shipment_id === id || s.tracking_id === id; });
    if (!shipment) { results.push({ id, ok: false, error: 'Not found' }); return; }
    appendRows(updateSheet, [[
      Utilities.getUuid(), id, status, '', note, '', 'true', '[]', '[]', 'false', '', '',
      auth.actor, now,
    ]]);
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === shipment.shipment_id) {
        shipmentSheet.getRange(i + 1, 17).setValue(status);
        shipmentSheet.getRange(i + 1, 19).setValue(now);
        break;
      }
    }
    logAction(auth.actor, auth.role, 'bulkUpdate', 'shipment', id, { status: status });
    results.push({ id, ok: true });
  });

  return jsonResponse({ ok: true, results });
}

function createWeeklyBackup() {
  const ss = getSpreadsheet();
  const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const copy = ss.copy('BuySmart Backup ' + date);
  const backupFolderId = getProp('BACKUP_FOLDER_ID', '');
  if (backupFolderId) {
    try { DriveApp.getFolderById(backupFolderId).addFile(DriveApp.getFileById(copy.getId())); } catch (error) {}
  }
  return copy.getUrl();
}

function setupWeeklyBackupTrigger() {
  ScriptApp.newTrigger('createWeeklyBackup').timeBased().everyWeek(1).create();
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('BuySmart')
    .addItem('Ensure sheets exist', 'ensureSheets')
    .addItem('Run weekly backup now', 'createWeeklyBackup')
    .addItem('Install weekly backup trigger', 'setupWeeklyBackupTrigger')
    .addToUi();
}

  ]]);

  logAction(auth.actor, auth.role, 'createShipment', 'shipment', shipmentId, {
    tracking_id: trackId, invoice_number: invoiceNumber, client_name: clientName,
  });

  return jsonResponse({ ok: true, tracking_id: trackId, shipment_id: shipmentId, client_id: clientId });
}

        }),
        items: items.map(function (i) {
          return {
            item_id: i.item_id,
            name: i.name,
            quantity_total: i.quantity_total,
            quantity_shipped: i.quantity_shipped,
            status: i.status,
          };
        }),
      });
    }

    if (action === 'shipments') {
      const auth = authenticate(params.passphrase, params.actor || 'staff');
      if (!auth.ok) return errorResponse(auth.error, 403);
      return jsonResponse({ ok: true, shipments: listShipments() });
    }

    if (action === 'shipment') {
      const auth = authenticate(params.passphrase, params.actor || 'staff');
      if (!auth.ok) return errorResponse(auth.error, 403);
      const full = getShipmentFull(params.id);
      if (!full) return errorResponse('Shipment not found', 404);
      return jsonResponse({ ok: true, shipment: full });
    }

    return errorResponse('Unknown action', 400);
  } catch (error) {
    return errorResponse(error.message || 'Request failed', 500);
  }
}
