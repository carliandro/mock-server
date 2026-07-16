const http = require('http');
const { matchPath, extractParams, json } = require('./lib/helpers');
const { broadcastSSE } = require('./lib/sse');

const PORT = 8081;
const SSE_HEARTBEAT_MS = 15000;

const authRoutes = require('./domains/auth').routes;
const appointmentRoutes = require('./domains/appointments').routes;
const patientRoutes = require('./domains/patients').routes;
const doctorRoutes = require('./domains/doctors').routes;
const expenseRoutes = require('./domains/expenses').routes;
const cashFlowRoutes = require('./domains/cash-flow').routes;
const insurancePaymentRoutes = require('./domains/insurance-payments').routes;
const miscRoutes = require('./domains/misc').routes;

const routes = [
  ...authRoutes,
  ...appointmentRoutes,
  ...patientRoutes,
  ...doctorRoutes,
  ...expenseRoutes,
  ...cashFlowRoutes,
  ...insurancePaymentRoutes,
  ...miscRoutes,
];

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Dental-Office-Id, Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = new URL(req.url, 'http://localhost');
  const pathname = parsed.pathname;

  for (const route of routes) {
    if (route.method !== req.method) continue;
    if (!matchPath(route.pattern, pathname)) continue;
    const params = extractParams(route.pattern, pathname);
    try {
      await route.handler(req, res, params);
    } catch (err) {
      console.error('Handler error:', err);
      json(res, 500, { error: 'Internal server error' });
    }
    return;
  }

  console.log(`[404] ${req.method} ${pathname}`);
  json(res, 404, { error: 'Not found', path: pathname });
});

server.listen(PORT, () => {
  console.log(`Mock server rodando em http://localhost:${PORT}`);
});

setInterval(() => {
  broadcastSSE({ action: 'heartbeat', timestamp: Date.now() }, 'heartbeat');
}, SSE_HEARTBEAT_MS);
