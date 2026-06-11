/**
 * Validates that the date read is not in the future.
 * @param {string} dateString YYYY-MM-DD
 * @param {Date} currentDate Reference date for today
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateDateRead(dateString, currentDate = new Date()) {
  if (!dateString) {
    return { isValid: false, error: "Date read is required." };
  }

  // Enforce YYYY-MM-DD format strictly
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return { isValid: false, error: "Invalid date format." };
  }

  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-based index
  const day = parseInt(parts[2], 10);

  if (year < 1000 || year > 9999 || month < 0 || month > 11 || day < 1 || day > 31) {
    return { isValid: false, error: "Invalid date." };
  }

  const localDate = new Date(year, month, day);
  if (isNaN(localDate.getTime())) {
    return { isValid: false, error: "Invalid date." };
  }

  // Check for date overflow (e.g. Feb 31 -> Mar 3)
  if (localDate.getFullYear() !== year || localDate.getMonth() !== month || localDate.getDate() !== day) {
    return { isValid: false, error: "Invalid date." };
  }

  // set reference date to end of current day in local timezone
  const maxDate = new Date(currentDate);
  maxDate.setHours(23, 59, 59, 999);

  if (localDate > maxDate) {
    return { isValid: false, error: "You cannot select a date read in the future." };
  }

  return { isValid: true };
}

/**
 * Prepares the log payload, determining whether to create a new log or update an existing one.
 * @param {string|undefined} initialId 
 * @param {boolean} saveAsNew 
 * @param {Object} fields 
 * @returns {Object} Payload with ID set appropriately
 */
export function prepareLogPayload(initialId, saveAsNew, fields) {
  return {
    id: saveAsNew ? undefined : initialId,
    ...fields
  };
}
