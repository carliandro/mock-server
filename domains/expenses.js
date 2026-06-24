const { json, readBody, buildExpenseFromBody } = require('../lib/helpers');

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
