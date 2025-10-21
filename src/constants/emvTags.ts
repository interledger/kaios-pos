/**
 * EMV Tag Identifiers
 * These are standard tags defined in the EMV specification
 */
export const EMV_TAGS = {
  // Response Tags
  RESPONSE_MESSAGE_TEMPLATE: "77", // Response Message Template Format 2

  // Cryptogram Tags
  APPLICATION_CRYPTOGRAM: "9F26", // Application Cryptogram (8 bytes)
  CRYPTOGRAM_INFO_DATA: "9F27", // Cryptogram Information Data (1 byte)

  // Transaction Data Tags
  UNPREDICTABLE_NUMBER: "9F37", // Unpredictable Number (4 bytes)
  TRANSACTION_DATE: "9A", // Transaction Date (3 bytes: YYMMDD)
  TRANSACTION_TIME: "9F21", // Transaction Time (3 bytes: HHMMSS)
  AMOUNT_AUTHORISED: "9F02", // Amount, Authorised (6 bytes BCD)
  TRANSACTION_CURRENCY_CODE: "5F2A", // Transaction Currency Code (2 bytes)
  TRANSACTION_CURRENCY_EXPONENT: "5F36", // Transaction Currency Exponent (1 byte)

  // PIN Tags
  PIN_TRY_COUNTER: "9F17", // PIN Try Counter (1 byte)
  TRANSACTION_PIN_DATA: "99", // Transaction PIN Data (8 bytes)

  // GPO Tags
  APPLICATION_TRANSACTION_COUNTER: "9F36", // Application Transaction Counter (ATC) (2 bytes)
  APPLICATION_INTERCHANGE_PROFILE: "82", // Application Interchange Profile (AIP)
  APPLICATION_FILE_LOCATOR: "94", // Application File Locator (AFL)
  CDOL1: "8C", // Card Data Object List 1

  // READ RECORD Tags
  SENDER_WALLET_ADDRESS: "C1", // Sender Wallet Address (variable length)

  // Wallet Address Tags (for TLV payload)
  RECEIVER_WALLET_ADDRESS: "DF01", // Receiver Wallet Address (variable length)
  SENDER_WALLET_ADDRESS_TLV: "DF02", // Sender Wallet Address (variable length)
} as const;
