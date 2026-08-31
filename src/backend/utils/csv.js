function csvEscape(value) {
  if (value === undefined || value === null) return '""';
  const s = String(value);
  // RFC4180: wrap in quotes, and double any internal quotes.
  return `"${s.replace(/"/g, '""')}"`;
}

function csvLine(values) {
  return `${values.map(csvEscape).join(',')}\r\n`;
}

module.exports = { csvEscape, csvLine };
