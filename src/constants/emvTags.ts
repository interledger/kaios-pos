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

  // PIN Tags
  PIN_TRY_COUNTER: "9F17", // PIN Try Counter (1 byte)
  TRANSACTION_PIN_DATA: "99", // Transaction PIN Data (8 bytes)
} as const;
