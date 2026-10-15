const { json, readBody, buildExpenseFromBody } = require('../lib/helpers');

// Datas RELATIVAS ao mês corrente (mock real: o mês sempre tem vida).
// Formata LOCAL (toISOString é UTC e após 21h no BR virava "amanhã").
const iso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};
const diaMes = (offsetMonths, dia) => {
  const t = new Date();
  return iso(new Date(t.getFullYear(), t.getMonth() + offsetMonths, dia));
};

const expenses = [
  // ── Pagas DESTE mês ──
  { id: 1, date: diaMes(0, 5), paidDate: diaMes(0, 4), category: "Despesa Fixa", description: "Aluguel da clínica", notes: "Referente ao mês corrente", subtotal: 3500.00, status: "pago", paidForms: "Pix", installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 2, date: diaMes(0, 10), paidDate: diaMes(0, 10), category: "Salários da Equipe", description: "Salário recepcionista", notes: null, subtotal: 2200.00, status: "pago", paidForms: "Transferência", installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 3, date: diaMes(0, 12), paidDate: diaMes(0, 11), category: "Despesas Gerais", description: "Energia Elétrica", notes: "Conta CEMIG", subtotal: 890.50, status: "pago", paidForms: "Boleto", installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },

  // ── Crédito (fatura do cartão, parcelado) — pago no cartão neste mês ──
  { id: 4, date: diaMes(0, 15), paidDate: diaMes(0, 15), category: "Dentais", description: "Aparelho ortodôntico", notes: "Parcelado no cartão", subtotal: 1200.00, status: "pago", paidForms: "Crédito", installments: null, installmentLabel: null, creditInstallments: 3, billingOffset: 0 },

  // ── A pagar DESTE mês (em aberto) ──
  { id: 5, date: diaMes(0, 20), paidDate: null, category: "Despesas Gerais", description: "Internet fibra 500MB", notes: "Vivo Empresas", subtotal: 149.90, status: "a_vencer", paidForms: null, installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 6, date: diaMes(0, 22), paidDate: null, category: "Impostos", description: "DAS Simples Nacional", notes: "Competência do mês", subtotal: 1850.00, status: "a_vencer", paidForms: null, installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 7, date: diaMes(0, 25), paidDate: null, category: "Laboratórios", description: "Prótese total superior", notes: "Lab Odonto SP", subtotal: 700.00, status: "a_vencer", paidForms: null, installments: 6, installmentLabel: "2/6", creditInstallments: null, billingOffset: 0 },
  { id: 8, date: diaMes(0, 28), paidDate: null, category: "Dentais", description: "Resina Z350 e consumíveis", notes: "Compra mensal", subtotal: 2300.00, status: "a_vencer", paidForms: null, installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },

  // ── ATRASADAS (meses anteriores, em aberto) — alimentam o alerta ──
  { id: 9, date: diaMes(-1, 5), paidDate: null, category: "Laboratórios", description: "Coroa de zircônia", notes: "Lab Odonto SP", subtotal: 1200.00, status: "atrasado", paidForms: null, installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 10, date: diaMes(-1, 12), paidDate: null, category: "Despesas Gerais", description: "Manutenção do compressor", notes: "Assistência técnica", subtotal: 280.00, status: "atrasado", paidForms: null, installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
  { id: 11, date: diaMes(-2, 20), paidDate: null, category: "Dentais", description: "Anestésicos e descartáveis", notes: "Pedido atrasado", subtotal: 350.00, status: "atrasado", paidForms: null, installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },

  // ── Paga de OUTRO mês, quitada neste mês (linha "Pagos de outros meses") ──
  { id: 12, date: diaMes(-1, 20), paidDate: diaMes(0, 2), category: "Impostos", description: "DAS Simples Nacional", notes: "Competência do mês anterior", subtotal: 1850.00, status: "pago_atrasado", paidForms: "Boleto", installments: null, installmentLabel: null, creditInstallments: null, billingOffset: 0 },
];
let expenseIdSeq = 100;

const routes = [
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
];

module.exports = { routes };
