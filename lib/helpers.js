function matchPath(pattern, path) {
  if (pattern === path) return true;
  const regex = new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$');
  return regex.test(path);
}

function extractParams(pattern, path) {
  const paramNames = [];
  const regexStr = pattern.replace(/:(\w+)/g, (_, name) => { paramNames.push(name); return '([^/]+)'; });
  const match = path.match(new RegExp('^' + regexStr + '$'));
  if (!match) return {};
  const params = {};
  paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
  return params;
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function normalizeDate(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return String(value);
}

function buildExpenseFromBody(body, id) {
  return {
    id,
    date: normalizeDate(body.date),
    paidDate: body.paidDate ? normalizeDate(body.paidDate) : null,
    category: body.category,
    description: body.description,
    notes: body.notes ?? null,
    subtotal: body.subtotal != null ? Number(body.subtotal) : 0,
    status: body.status ?? 'a_vencer',
    paidForms: body.paidForms ?? null,
    installments: body.installments ?? null,
    installmentLabel: body.installmentLabel ?? null,
    creditInstallments: body.creditInstallments ?? null,
    billingOffset: body.billingOffset ?? 0,
  };
}

function matchInsuranceIds(ids, paymentId) {
  if (!Array.isArray(ids)) return false;
  return ids.some(id => Number(id) === Number(paymentId));
}

module.exports = { matchPath, extractParams, json, readBody, normalizeDate, buildExpenseFromBody, matchInsuranceIds };
