# BuySmart Shared Data — Setup Guide

This guide sets up the Google Sheet + Google Apps Script backend that stores shipments,
updates, documents and audit logs for the BuySmart PWA. No database server and no
developer are needed — just a Google account.

## What you will create
1. A Google Sheet (the shared database)
2. A Google Apps Script web app in front of it
3. A Google Drive folder for photos and documents
4. Two passphrases (Staff and Admin) stored only in Apps Script properties
5. The web app URL, pasted into the BuySmart app Settings screen

## Step 1 — Create the Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Name it **BuySmart Shared Data**.
3. Open the sheet, then click **Extensions → Apps Script**.
4. Delete any code in `Code.gs` and paste the entire contents of `server/apps-script/Code.gs` from this repo.
5. Click **Save** (name the project "BuySmart Backend").

## Step 2 — Set the passphrases
1. In the Apps Script editor, click **Project settings** (gear icon ⚙️ on the left).
2. Under **Script properties**, add these two properties:
   - `STAFF_PASSPHRASE` — e.g. `Staff2026!` (used by staff to create/update shipments)
   - `ADMIN_PASSPHRASE` — e.g. `Admin2026!` (used by admins for everything)
3. Click **Save script properties**.

> Never put these passphrases in the app code, the repo, or the PWA. They live only in
> Apps Script properties and are checked by the script on every request.

## Step 3 — Create the Drive folder (optional)
Photos and documents uploaded from the phone go to a Drive folder.
1. Go to [drive.google.com](https://drive.google.com) and create a folder named **BuySmart Uploads**.
2. Open the folder and copy the ID from the URL (the long string between `/folders/` and `?` or `/`).
3. Back in Apps Script **Project settings → Script properties**, add:
   - `DRIVE_FOLDER_ID` — paste the folder ID.
4. Click **Save script properties**.

If you skip this, the script creates a folder called **BuySmart Uploads** automatically.

## Step 4 — Deploy as a web app
1. In the Apps Script editor, click **Deploy → New deployment**.
2. Choose type **Web app**.
3. Configure:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Authorize the script when prompted (it needs to read/write your Sheet and Drive).
6. Copy the **Deployment web app URL**. It looks like:
   `https://script.google.com/macros/s/........../exec`

## Step 5 — Paste the URL into the app
1. Open the BuySmart PWA.
2. Go to **Settings** and paste the web app URL into **Google Apps Script URL**.
3. Tap **Save settings** and then **Test connection**. You should see "Connected."
4. Switch on the features you want to use (all are on by default).

## Step 6 — Set up automatic weekly backups (recommended)
1. In the Apps Script editor, open `Code.gs`.
2. Run the function **setupWeeklyBackupTrigger** once (select it from the dropdown and click Run).
3. Authorize when prompted. This installs a timer that runs `createWeeklyBackup` every week.
4. Each backup creates a copy of the sheet named "BuySmart Backup <date>" in your Drive.

To change the backup schedule, edit the trigger under **Triggers** (clock icon ⏰ on the left).

## How it works
- **Clients** never log in. A public tracking link contains the tracking ID plus a random
  code (e.g. `BSP-TRK-0001-X7K2`), so nobody can guess another client's page.
- **Staff and Admin** passphrases are checked by the script on every request. After 5 wrong
  attempts within 24 hours, the actor is locked out for 30 minutes.
- Every staff change is written to the `audit_log` sheet (who, what, when). History is
  never deleted — mistakes are fixed by adding a new update.
- Photos and documents are stored in Drive; the sheet stores the links.

## Files in this folder
- `Code.gs` — the Apps Script backend (paste into Apps Script)
- `SETUP.md` — this file
