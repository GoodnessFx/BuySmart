/**
 * Single source of truth for the company settlement account.
 *
 * Every surface that asks a client to pay — the public invoice page, the client
 * portal, the management desk and both PDF documents — reads these values, so a
 * change here updates the account details everywhere at once.
 */

export type CompanyBankAccount = {
  /** Full name as registered with the bank / Paystack payout profile. */
  bankName: string;
  /** Short label used in tight layouts. */
  shortName: string;
  accountNumber: string;
  accountName: string;
};

export const COMPANY_ACCOUNT_NAME = 'BUYSMART PROCUREMENT LIMITED';

export const COMPANY_BANK_ACCOUNTS: CompanyBankAccount[] = [
  {
    bankName: 'OPay Digital Services Limited (OPay)',
    shortName: 'OPay',
    accountNumber: '8100130714',
    accountName: COMPANY_ACCOUNT_NAME,
  },
];

export const PRIMARY_BANK_ACCOUNT: CompanyBankAccount = COMPANY_BANK_ACCOUNTS[0];

/** One-line account summary used in WhatsApp messages and compact footers. */
export function bankAccountLine(account: CompanyBankAccount = PRIMARY_BANK_ACCOUNT): string {
  return `${account.bankName} • Acct: ${account.accountNumber} • ${account.accountName}`;
}
