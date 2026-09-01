function sanitizeCsvValue(value) {
  // Mitigate CSV/Excel formula injection. If a value begins with one of these
  // characters, spreadsheet applications may treat it as a formula.
  // OWASP: https://owasp.org/www-community/attacks/CSV_Injection
  if (value === undefined || value === null) return value;

  const s = String(value);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

function csvEscape(value) {
  if (value === undefined || value === null) return '""';

  const s = sanitizeCsvValue(value);
  // RFC4180: wrap in quotes, and double any internal quotes.
  return `"${String(s).replace(/"/g, '""')}"`;
}

function csvLine(values) {
  return `${values.map(csvEscape).join(',')}\r\n`;
}

module.exports = { csvEscape, csvLine };
