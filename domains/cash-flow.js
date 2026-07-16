const { json, readBody } = require('../lib/helpers');

const cashFlow = [
  { id: 1, date: "10/05/2026", type: "Entrada", description: "Pagamento de paciente", category: "Particular", insuranceId: 1, procedures: [{ patient: "João Silva Pereira Santos", procedure: "Limpeza dental", region: "Arcadas", subtotal: 200, consultationDate: "09/02/2026" }] },
  { id: 2, date: "15/03/2026", type: "Entrada", description: "Hapvida", notes: "Produção mensal", category: "Convênios", procedures: [{ patient: "Maria Clara Oliveira", procedure: "Obturação", region: "Molar superior", face: "Oclusal", subtotal: 3000, consultationDate: "12/03/2026" }, { patient: "João Silva Pereira Santos", procedure: "Extração", region: "Incisivo inferior", subtotal: 450, consultationDate: "15/03/2026" }, { patient: "Ana Beatriz Costa", procedure: "Profilaxia", subtotal: 200, consultationDate: "15/03/2026" }, { patient: "Teste", procedure: "Testando procedimento", subtotal: 200, consultationDate: "14/03/2026" }] },
  { id: 3, date: "12/02/2026", type: "Saída", description: "Atendente - Salário de fevereiro", notes: "Equipe clínica e administrativa", category: "Salários", subtotal: 3000 },
  { id: 4, date: "11/02/2026", type: "Saída", description: "Compra de materiais odontológicos", notes: "Luvas e máscaras", category: "Dental", subtotal: 150 },
];
let cashFlowIdSeq = 100;

const routes = [
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
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    res.end();
  }},
];

module.exports = { routes };
