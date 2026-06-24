const http = require('http');

const PORT = 8081;
const SSE_HEARTBEAT_MS = 15000;

// ────────────────────────────────────────
// In-memory data stores
// ────────────────────────────────────────

const appointments = [
  { id: 1, patientId: 1, patientName: "João Batista de Souza", patientPhone: "(11) 98765-4321", cpf: "123.456.789-00", doctorId: 1, doctorName: "Dra. Maria da Costa", doctor: "Dra. Maria da Costa", duration: 30, appointmentDate: "2026-06-18", startTime: "09:00:00", endTime: "09:30:00", status: "AGENDADO", reason: "Consulta de rotina", notes: null, dentalOfficeId: 1 },
  { id: 2, patientId: 2, patientName: "Maria Aparecida Santos", patientPhone: "(11) 97654-3210", cpf: "987.654.321-00", doctorId: 2, doctorName: "Dr. Carlos Oliveira", doctor: "Dr. Carlos Oliveira", duration: 45, appointmentDate: "2026-06-18", startTime: "10:00:00", endTime: "10:45:00", status: "CONFIRMADO", reason: "Canal", notes: null, dentalOfficeId: 1 },
];
let appointmentIdSeq = 100;

const patients = [
  { id: 1, name: "João Batista de Souza", lastName: "", gender: "MALE", dateOfBirth: "1990-05-15", cpf: "123.456.789-00", phone: "(11) 98765-4321", mobile: "(11) 91234-5678", email: "joao.souza@email.com", zipCode: "01310-100", street: "Av. Paulista", number: "1000", complement: "Apto 42", neighborhood: "Bela Vista", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", address: { zipCode: "01310-100", street: "Av. Paulista", number: "1000", complement: "Apto 42", neighborhood: "Bela Vista", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", cityId: 1 }, insurance: { insuranceId: 1, insuranceName: "Unimed", insuranceNumber: "1234567890", expirationDate: "2026-12-31", planCategory: "ENFERMARIA", planCompany: "Unimed Paulistana", planHolder: "João Batista de Souza", holderCpf: "123.456.789-00" }, insuranceProviderId: 1, insuranceProviderName: "Unimed", insurancePolicyNumber: "1234567890", insuranceExpirationDate: "2026-12-31", insuranceCategory: "ENFERMARIA", insuranceCompany: "Unimed Paulistana", planHolder: "João Batista de Souza", planHolderCpf: "123.456.789-00", status: "active", photo: null, dentalOfficeId: 1 },
  { id: 2, name: "Maria Aparecida Santos", lastName: "", gender: "FEMALE", dateOfBirth: "1985-08-22", cpf: "987.654.321-00", phone: "(11) 97654-3210", mobile: "(11) 99876-5432", email: "maria.santos@email.com", zipCode: "04547-000", street: "Rua Iguatemi", number: "500", complement: "", neighborhood: "Itaim Bibi", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", address: { zipCode: "04547-000", street: "Rua Iguatemi", number: "500", complement: "", neighborhood: "Itaim Bibi", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", cityId: 1 }, insurance: { insuranceId: 2, insuranceName: "Bradesco Saúde", insuranceNumber: "0987654321", expirationDate: "2026-06-30", planCategory: "APARTAMENTO", planCompany: "Bradesco Saúde", planHolder: "Maria Aparecida Santos", holderCpf: "987.654.321-00" }, insuranceProviderId: 2, insuranceProviderName: "Bradesco Saúde", insurancePolicyNumber: "0987654321", insuranceExpirationDate: "2026-06-30", insuranceCategory: "APARTAMENTO", insuranceCompany: "Bradesco Saúde", planHolder: "Maria Aparecida Santos", planHolderCpf: "987.654.321-00", status: "active", photo: null, dentalOfficeId: 1 },
  { id: 3, name: "Pedro Henrique Lima", lastName: "", gender: "MALE", dateOfBirth: "1978-03-10", cpf: "456.789.123-00", phone: "(11) 96543-2109", mobile: "(11) 98765-1234", email: "pedro.lima@email.com", zipCode: "01414-001", street: "Rua Augusta", number: "2500", complement: "Casa", neighborhood: "Consolação", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", address: { zipCode: "01414-001", street: "Rua Augusta", number: "2500", complement: "Casa", neighborhood: "Consolação", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", cityId: 1 }, insurance: { insuranceId: 3, insuranceName: "Amil", insuranceNumber: "5678901234", expirationDate: "2026-09-30", planCategory: "ENFERMARIA", planCompany: "Amil Assistência Médica", planHolder: "Pedro Henrique Lima", holderCpf: "456.789.123-00" }, insuranceProviderId: 3, insuranceProviderName: "Amil", insurancePolicyNumber: "5678901234", insuranceExpirationDate: "2026-09-30", insuranceCategory: "ENFERMARIA", insuranceCompany: "Amil Assistência Médica", planHolder: "Pedro Henrique Lima", planHolderCpf: "456.789.123-00", status: "active", photo: null, dentalOfficeId: 1 },
  { id: 4, name: "Ana Carolina Ferreira", lastName: "", gender: "FEMALE", dateOfBirth: "1995-11-28", cpf: "789.123.456-00", phone: "(11) 95432-1098", mobile: "(11) 97654-3210", email: "ana.ferreira@email.com", zipCode: "05422-001", street: "Rua Cardeal Arcoverde", number: "750", complement: "Apto 101", neighborhood: "Pinheiros", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", address: { zipCode: "05422-001", street: "Rua Cardeal Arcoverde", number: "750", complement: "Apto 101", neighborhood: "Pinheiros", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", cityId: 1 }, insurance: { insuranceId: 0, insuranceName: "Particular", insuranceNumber: "", expirationDate: null, planCategory: "", planCompany: "", planHolder: "", holderCpf: "" }, insuranceProviderId: 0, insuranceProviderName: "Particular", insurancePolicyNumber: "", insuranceExpirationDate: null, insuranceCategory: "", insuranceCompany: "", planHolder: "", planHolderCpf: "", status: "active", photo: null, dentalOfficeId: 1 },
];
let patientIdSeq = 100;

const cashFlow = [
  { id: 1, date: "10/05/2026", type: "Entrada", description: "Pagamento de paciente", category: "Particular", insuranceId: 1, procedures: [{ patient: "João Silva Pereira Santos", procedure: "Limpeza dental", region: "Arcadas", subtotal: 200, consultationDate: "09/02/2026" }] },
  { id: 2, date: "15/03/2026", type: "Entrada", description: "Hapvida", notes: "Produção mensal", category: "Convênios", procedures: [{ patient: "Maria Clara Oliveira", procedure: "Obturação", region: "Molar superior", face: "Oclusal", subtotal: 3000, consultationDate: "12/03/2026" }, { patient: "João Silva Pereira Santos", procedure: "Extração", region: "Incisivo inferior", subtotal: 450, consultationDate: "15/03/2026" }, { patient: "Ana Beatriz Costa", procedure: "Profilaxia", subtotal: 200, consultationDate: "15/03/2026" }, { patient: "Teste", procedure: "Testando procedimento", subtotal: 200, consultationDate: "14/03/2026" }] },
  { id: 3, date: "12/02/2026", type: "Saída", description: "Atendente - Salário de fevereiro", notes: "Equipe clínica e administrativa", category: "Salários", subtotal: 3000 },
  { id: 4, date: "11/02/2026", type: "Saída", description: "Compra de materiais odontológicos", notes: "Luvas e máscaras", category: "Dental", subtotal: 150 },
];
let cashFlowIdSeq = 100;

const expenses = [
  { id: 1, date: "2026-06-10", paidDate: "2026-06-08", category: "Despesa Fixa", description: "Aluguel", notes: "Referente a junho/2026", subtotal: 3500.00, status: "pago", paidForms: "Pix", installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 2, date: "2026-06-15", paidDate: null, category: "Despesas Gerais", description: "Energia Elétrica", notes: "Conta CEMIG", subtotal: 890.50, status: "a_vencer", paidForms: null, installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 3, date: "2026-05-20", paidDate: null, category: "Dentais", description: "Resina Z350 e consumíveis", notes: "Compra mensal", subtotal: 2300.00, status: "atrasado", paidForms: null, installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 4, date: "2026-06-01", paidDate: "2026-06-01", category: "Dentais", description: "Aparelho ortodôntico", notes: "Parcelado no cartão", subtotal: 1200.00, status: "pago", paidForms: "Crédito", installments: null, installmentLabel: null, creditInstallments: 3, billingOffset: 0 },
  { id: 5, date: "2026-06-05", paidDate: null, category: "Laboratórios", description: "Prótese total superior", notes: "Lab Odonto SP", subtotal: 700.00, status: "a_vencer", paidForms: null, installments: 6, installmentLabel: "2/6", creditInstallments: null, billingOffset: 0 },
  { id: 6, date: "2026-06-12", paidDate: "2026-06-11", category: "Salários da Equipe", description: "Salário recepcionista", notes: null, subtotal: 2200.00, status: "pago_antecipado", paidForms: "Transferência", installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 7, date: "2026-05-28", paidDate: "2026-06-02", category: "Impostos", description: "DAS Simples Nacional", notes: "Competência maio", subtotal: 1850.00, status: "pago_atrasado", paidForms: "Boleto", installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
];
let expenseIdSeq = 100;

const insurancePayments = (() => {
  const base = [
    { id: 2, patientId: 2, procedure: "Raspagem Supra-Gengival", region: "Arcadas", insuranceId: 2, consultationDate: "12/02/2026", value: 350, status: "Pendente" },
    { id: 5, patientId: 3, procedure: "Restauração em resina 1 face", region: "Dente 15", face: "OMD", insuranceId: 3, consultationDate: "14/02/2026", value: 180, status: "Pendente" },
    { id: 3, patientId: 2, procedure: "Restauração em resina 3 faces", region: "Dente 45", face: "OMD", insuranceId: 4, consultationDate: "12/02/2026", value: 400, status: "Pago", paymentDate: "20/02/2026" },
    { id: 6, patientId: 4, procedure: "Radiografia panorâmica", region: "Arcadas", insuranceId: 2, consultationDate: "15/02/2026", value: 120, status: "Pago", paymentDate: "22/02/2026" },
    { id: 4, patientId: 3, procedure: "Exodontia Simples Permanente", region: "Dente 36", insuranceId: 3, consultationDate: "13/02/2026", glosaDate: "15/03/2026", appealDate: "20/03/2026", glosaReason: "Procedimento não autorizado pelo convênio", value: 250, status: "Recurso" },
    { id: 10, patientId: 3, procedure: "Coroa Metalocerâmica", region: "Dente 16", insuranceId: 3, consultationDate: "20/02/2026", glosaDate: "30/05/2026", rejectionDate: "02/06/2026", glosaReason: "Procedimento não autorizado pelo convênio", value: 250, status: "Rejeitado" },
    { id: 7, patientId: 4, procedure: "Coroa metálica fundida", region: "Dente 14", insuranceId: 4, consultationDate: "15/02/2026", glosaDate: "20/05/2026", glosaReason: "Falta de radiografia inicial e final", value: 600, status: "Glosado" },
  ];
  const generated = Array.from({ length: 250 }, (_, i) => ({
    id: 1000 + i, patientId: (i % 4) + 1, procedure: `Procedimento teste ${i + 1}`,
    region: `Região ${i + 1}`, insuranceId: (i % 4) + 2,
    consultationDate: "16/02/2026", value: 100 + (i % 5) * 50, status: "Pendente"
  }));
  return [...base, ...generated];
})();
let insurancePaymentIdSeq = 2000;

const doctors = [
  { id: 1, name: "Dra. Maria da Costa", phone: "(11) 91234-5678", specialty: "Cirurgiã-Dentista", dentalOfficeId: 1 },
  { id: 2, name: "Dr. Carlos Oliveira", phone: "(11) 92345-6789", specialty: "Ortodontista", dentalOfficeId: 1 },
  { id: 3, name: "Dra. Ana Silva", phone: "(11) 93456-7890", specialty: "Periodontista", dentalOfficeId: 1 },
  { id: 4, name: "Dr. Roberto Lima", phone: "(11) 94567-8901", specialty: "Endodontista", dentalOfficeId: 1 },
  { id: 5, name: "Dra. Juliana Mendes", phone: "(11) 95678-9012", specialty: "Odontopediatra", dentalOfficeId: 1 },
];

// ────────────────────────────────────────
// SSE clients
// ────────────────────────────────────────

let sseClients = [];

function broadcastSSE(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  sseClients = sseClients.filter(c => {
    try { c.write(msg); return true; } catch { return false; }
  });
}

// ────────────────────────────────────────
// Route matching helpers
// ────────────────────────────────────────

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

// ────────────────────────────────────────
// Route definitions
// ────────────────────────────────────────

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
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

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

function updateInsurancePayments(ids, updater) {
  const updated = [];
  insurancePayments.forEach(payment => {
    if (!matchInsuranceIds(ids, payment.id)) return;
    updater(payment);
    updated.push(payment);
  });
  return updated;
}

const routes = [
  // ── Auth ──
  { method: 'POST', pattern: '/api/v1/auth/login', async handler(req, res) {
    json(res, 200, {
      user: { id: 1, name: "Admin Dev", email: "admin@mock.com" },
      dentalOffice: { id: 1, name: "Sorriso Perfeito - Matriz", tradeName: "Sorriso Perfeito Ltda" },
      token: "eyJhbGciOiJIUzI1NiJ9.mock-dev-token",
      refreshToken: "mock-refresh-token-123"
    });
  }},

  // ── SSE stream (antes de :id para não casar como parâmetro) ──
  { method: 'GET', pattern: '/api/v1/appointments/stream', async handler(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, X-Dental-Office-Id',
    });
    res.write(`data: {"action":"CONNECTED","message":"Conectado ao servidor mock"}\n\n`);
    sseClients.push(res);
    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
    });
  }},
  { method: 'GET', pattern: '/api/v1/appointments/locks/stream', async handler(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, X-Dental-Office-Id',
    });
    res.write(`data: {"action":"CONNECTED","message":"Conectado ao servidor mock (locks)"}\n\n`);
    sseClients.push(res);
    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
    });
  }},

  // ── Appointments ──
  { method: 'GET', pattern: '/api/v1/appointments/all', async handler(req, res) {
    json(res, 200, appointments);
  }},
  { method: 'GET', pattern: '/api/v1/appointments/range', async handler(req, res) {
    json(res, 200, appointments);
  }},
  { method: 'GET', pattern: '/api/v1/appointments/:id', async handler(req, res, params) {
    const app = appointments.find(a => a.id === Number(params.id));
    if (!app) { json(res, 404, { error: 'Not found' }); return; }
    json(res, 200, app);
  }},
  { method: 'POST', pattern: '/api/v1/appointments', async handler(req, res) {
    const body = await readBody(req);

    const patient = body.patient || {};
    const doctor = body.doctor || {};

    const resolvedDoctorName = body.doctorName ?? doctor.name ?? '';
    const resolvedPatientName = body.patientName ?? patient.name ?? '';
    const resolvedCpf = body.cpf ?? patient.cpf ?? '';
    const resolvedPatientPhone = body.patientPhone ?? patient.phone ?? patient.mobile ?? '';

    const newApp = {
      id: ++appointmentIdSeq,
      patientId: body.patientId ?? patient.id ?? 0,
      patientName: resolvedPatientName,
      patientPhone: resolvedPatientPhone,
      cpf: resolvedCpf,
      doctorId: body.doctorId ?? doctor.id ?? 0,
      doctorName: resolvedDoctorName,
      doctor: resolvedDoctorName,
      duration: body.duration ?? 30,
      appointmentDate: body.appointmentDate ?? '',
      startTime: body.startTime ?? '',
      status: body.status ?? 'AGENDADO',
      reason: body.reason ?? '',
      notes: body.notes ?? null,
      dentalOfficeId: body.dentalOfficeId ?? 1,
    };
    appointments.push(newApp);
    json(res, 201, newApp);
    broadcastSSE({ action: 'CREATE', appointment: newApp });
  }},
  { method: 'PUT', pattern: '/api/v1/appointments/:id', async handler(req, res, params) {
    const body = await readBody(req);
    const idx = appointments.findIndex(a => a.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }

    const patient = body.patient || {};
    const doctor = body.doctor || {};
    const prev = appointments[idx];

    const resolvedDoctorName = body.doctorName ?? doctor.name ?? prev.doctorName ?? '';
    const resolvedPatientName = body.patientName ?? patient.name ?? prev.patientName ?? '';

    appointments[idx] = {
      ...prev,
      id: Number(params.id),
      patientId: body.patientId ?? patient.id ?? prev.patientId,
      patientName: resolvedPatientName,
      patientPhone: body.patientPhone ?? patient.phone ?? patient.mobile ?? prev.patientPhone ?? '',
      cpf: body.cpf ?? patient.cpf ?? prev.cpf ?? '',
      doctorId: body.doctorId ?? doctor.id ?? prev.doctorId,
      doctorName: resolvedDoctorName,
      doctor: resolvedDoctorName,
      duration: body.duration ?? prev.duration,
      appointmentDate: body.appointmentDate ?? prev.appointmentDate,
      startTime: body.startTime ?? prev.startTime,
      status: body.status ?? prev.status,
      reason: body.reason ?? prev.reason ?? '',
      notes: body.notes ?? prev.notes ?? null,
      dentalOfficeId: body.dentalOfficeId ?? prev.dentalOfficeId,
    };
    json(res, 200, appointments[idx]);
    broadcastSSE({ action: 'UPDATE', appointment: appointments[idx] });
  }},
  { method: 'PUT', pattern: '/api/v1/appointments/:id/situation', async handler(req, res, params) {
    const body = await readBody(req);
    const idx = appointments.findIndex(a => a.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    appointments[idx] = { ...appointments[idx], status: body.status };
    json(res, 200, appointments[idx]);
    broadcastSSE({ action: 'UPDATE', appointment: appointments[idx] });
  }},
  { method: 'DELETE', pattern: '/api/v1/appointments/:id', async handler(req, res, params) {
    const id = Number(params.id);
    const idx = appointments.findIndex(a => a.id === id);
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    const removed = appointments.splice(idx, 1)[0];
    json(res, 200, { message: 'Appointment deleted' });
    broadcastSSE({ action: 'DELETE', appointment: { id: removed.id } });
  }},

  // ── Patients ──
  { method: 'GET', pattern: '/api/v1/patients/all', async handler(req, res) {
    json(res, 200, patients);
  }},
  { method: 'GET', pattern: '/api/v1/patients/select', async handler(req, res) {
    json(res, 200, patients.map(p => ({ id: p.id, name: p.name, phone: p.phone, documentNumber: p.cpf })));
  }},
  { method: 'GET', pattern: '/api/v1/patients/:id', async handler(req, res, params) {
    const pt = patients.find(p => p.id === Number(params.id));
    if (!pt) { json(res, 404, { error: 'Not found' }); return; }
    json(res, 200, pt);
  }},
  { method: 'GET', pattern: '/api/v1/patients', async handler(req, res) {
    const q = new URL(req.url, 'http://localhost').searchParams;
    const search = q.get('search');
    if (search) {
      const term = search.toLowerCase();
      const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.cpf.includes(term) ||
        p.phone.includes(term)
      ).map(p => ({ id: p.id, name: p.name, lastName: p.lastName, phone: p.phone, documentNumber: p.cpf, gender: p.gender, insuranceProviderId: p.insuranceProviderId, insuranceProviderName: p.insuranceProviderName, insurancePolicyNumber: p.insurancePolicyNumber }));
      json(res, 200, filtered);
    } else {
      json(res, 200, patients.map(p => ({ id: p.id, name: p.name, lastName: p.lastName, phone: p.phone, documentNumber: p.cpf, gender: p.gender, insuranceProviderId: p.insuranceProviderId, insuranceProviderName: p.insuranceProviderName, insurancePolicyNumber: p.insurancePolicyNumber })));
    }
  }},
  { method: 'POST', pattern: '/api/v1/patients', async handler(req, res) {
    const body = await readBody(req);
    const newPt = { id: ++patientIdSeq, ...body, status: 'active', dentalOfficeId: 1 };
    patients.push(newPt);
    json(res, 201, newPt);
  }},
  { method: 'POST', pattern: '/api/v1/patients/quick', async handler(req, res) {
    const body = await readBody(req);
    const newPt = { id: ++patientIdSeq, name: body.name || "Paciente Rápido", lastName: "", gender: "UNSPECIFIED", phone: body.phone || "", documentNumber: "", insuranceProviderId: 0, insuranceProviderName: "Particular", insurancePolicyNumber: "", status: "active", dentalOfficeId: 1 };
    patients.push(newPt);
    json(res, 201, newPt);
  }},
  { method: 'PUT', pattern: '/api/v1/patients/:id', async handler(req, res, params) {
    const body = await readBody(req);
    const idx = patients.findIndex(p => p.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    patients[idx] = { ...patients[idx], ...body, id: Number(params.id) };
    json(res, 200, patients[idx]);
  }},
  { method: 'DELETE', pattern: '/api/v1/patients/:id', async handler(req, res, params) {
    const idx = patients.findIndex(p => p.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    patients.splice(idx, 1);
    json(res, 204);
  }},

  // ── Doctors ──
  { method: 'GET', pattern: '/api/v1/doctors', async handler(req, res) {
    json(res, 200, { data: doctors });
  }},
  { method: 'GET', pattern: '/api/v1/doctors/select', async handler(req, res) {
    json(res, 200, doctors.map(d => ({ id: d.id, name: d.name })));
  }},

  // ── Cities ──
  { method: 'GET', pattern: '/api/v1/cities', async handler(req, res) {
    json(res, 200, { data: [
      { id: 1, name: "São Paulo", state: "SP" }, { id: 2, name: "Campinas", state: "SP" },
      { id: 3, name: "Ribeirão Preto", state: "SP" }, { id: 4, name: "São Bernardo do Campo", state: "SP" },
      { id: 5, name: "Santo André", state: "SP" }, { id: 6, name: "Osasco", state: "SP" },
      { id: 7, name: "Sorocaba", state: "SP" }, { id: 8, name: "Mauá", state: "SP" },
      { id: 9, name: "São José dos Campos", state: "SP" }, { id: 10, name: "Guarulhos", state: "SP" },
      { id: 11, name: "Rio de Janeiro", state: "RJ" }, { id: 12, name: "Niterói", state: "RJ" },
      { id: 13, name: "Duque de Caxias", state: "RJ" },
    ]});
  }},

  // ── Insurances ──
  { method: 'GET', pattern: '/api/v1/insurances/all', async handler(req, res) {
    json(res, 200, { data: [
      { id: 1, name: "Uniodonto", type: "Odontológico" }, { id: 2, name: "Amil Dental", type: "Odontológico" },
      { id: 3, name: "Bradesco Dental", type: "Odontológico" }, { id: 4, name: "SulAmérica Odonto", type: "Odontológico" },
    ]});
  }},

  // ── Expenses ──
  { method: 'GET', pattern: '/api/v1/expenses', async handler(req, res) {
    json(res, 200, expenses);
  }},
  { method: 'POST', pattern: '/api/v1/expenses', async handler(req, res) {
    const body = await readBody(req);
    const newExpense = buildExpenseFromBody(body, ++expenseIdSeq);
    expenses.push(newExpense);
    json(res, 201, newExpense);
  }},
  { method: 'PUT', pattern: '/api/v1/expenses/:id', async handler(req, res, params) {
    const body = await readBody(req);
    const id = Number(params.id);
    const idx = expenses.findIndex(e => e.id === id);
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    const updated = buildExpenseFromBody({ ...expenses[idx], ...body }, id);
    expenses[idx] = updated;
    json(res, 200, updated);
  }},
  { method: 'DELETE', pattern: '/api/v1/expenses/:id', async handler(req, res, params) {
    const idx = expenses.findIndex(e => e.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    expenses.splice(idx, 1);
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    res.end();
  }},

  // ── Laboratories ──
  { method: 'GET', pattern: '/api/v1/laboratories/all', async handler(req, res) {
    json(res, 200, { data: [
      { id: 1, name: "Lab Odonto SP", phone: "(11) 3123-4567" },
      { id: 2, name: "Prótese Dental Center", phone: "(11) 3234-5678" },
      { id: 3, name: "Lab Ultra Implantes", phone: "(11) 3345-6789" },
    ]});
  }},

  // ── Cash Flow ──
  { method: 'GET', pattern: '/api/v1/cash-flow', async handler(req, res) {
    json(res, 200, cashFlow);
  }},
  { method: 'POST', pattern: '/api/v1/cash-flow', async handler(req, res) {
    const body = await readBody(req);
    const newOp = { id: ++cashFlowIdSeq, ...body };
    cashFlow.push(newOp);
    json(res, 201, newOp);
  }},
  { method: 'PUT', pattern: '/api/v1/cash-flow/:id', async handler(req, res, params) {
    const body = await readBody(req);
    const idx = cashFlow.findIndex(o => o.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    cashFlow[idx] = { ...cashFlow[idx], ...body, id: Number(params.id) };
    json(res, 200, cashFlow[idx]);
  }},
  { method: 'DELETE', pattern: '/api/v1/cash-flow/:id', async handler(req, res, params) {
    const idx = cashFlow.findIndex(o => o.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    cashFlow.splice(idx, 1);
    json(res, 204);
  }},

  // ── Insurance Payments ──
  { method: 'GET', pattern: '/api/v1/insurance-payments', async handler(req, res) {
    json(res, 200, insurancePayments);
  }},
  { method: 'POST', pattern: '/api/v1/insurance-payments', async handler(req, res) {
    const body = await readBody(req);
    const newP = { id: ++insurancePaymentIdSeq, ...body };
    insurancePayments.push(newP);
    json(res, 201, newP);
  }},
  { method: 'POST', pattern: '/api/v1/insurance-payments/batch/pay', async handler(req, res) {
    const body = await readBody(req);
    const ids = body.ids ?? [];
    const updated = updateInsurancePayments(ids, p => {
      p.status = "Pago";
      p.paymentDate = body.paymentDate;
      delete p.glosaDate;
      delete p.appealDate;
      delete p.rejectionDate;
      delete p.glosaReason;
    });
    json(res, 200, { updated: updated.length, payments: updated });
  }},
  { method: 'POST', pattern: '/api/v1/insurance-payments/batch/glosa', async handler(req, res) {
    const body = await readBody(req);
    const ids = body.ids ?? [];
    const updated = updateInsurancePayments(ids, p => {
      p.status = "Glosado";
      p.glosaReason = body.reason;
      p.glosaDate = body.date;
      p.notes = body.notes;
      delete p.paymentDate;
    });
    json(res, 200, { updated: updated.length, payments: updated });
  }},
  { method: 'POST', pattern: '/api/v1/insurance-payments/batch/appeal', async handler(req, res) {
    const body = await readBody(req);
    const ids = body.ids ?? [];
    const updated = updateInsurancePayments(ids, p => {
      p.status = "Recurso";
      p.appealDate = body.date;
    });
    json(res, 200, { updated: updated.length, payments: updated });
  }},
  { method: 'POST', pattern: '/api/v1/insurance-payments/batch/reject', async handler(req, res) {
    const body = await readBody(req);
    const ids = body.ids ?? [];
    const updated = updateInsurancePayments(ids, p => {
      p.status = "Rejeitado";
      p.rejectionDate = body.date;
    });
    json(res, 200, { updated: updated.length, payments: updated });
  }},
  { method: 'POST', pattern: '/api/v1/insurance-payments/:id/revert', async handler(req, res, params) {
    const p = insurancePayments.find(x => x.id === Number(params.id));
    if (!p) { json(res, 404, { error: 'Not found' }); return; }
    p.status = "Pendente";
    delete p.paymentDate;
    delete p.glosaDate;
    delete p.appealDate;
    delete p.rejectionDate;
    delete p.glosaReason;
    delete p.notes;
    json(res, 200, p);
  }},

  // ── Medicines ──
  { method: 'GET', pattern: '/api/v1/medicines/all', async handler(req, res) {
    json(res, 200, { data: [
      { id: 1, name: "Amoxicilina 500mg", supplier: "MedFarma" },
      { id: 2, name: "Ibuprofeno 600mg", supplier: "Genérico" },
      { id: 3, name: "Lidocaína 2%", supplier: "Anestech" },
    ]});
  }},
];

// ────────────────────────────────────────
// Server
// ────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // CORS
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

// SSE heartbeat
setInterval(() => {
  broadcastSSE({ action: 'heartbeat', timestamp: Date.now() });
}, SSE_HEARTBEAT_MS);
