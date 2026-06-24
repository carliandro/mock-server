const { json, readBody, matchInsuranceIds } = require('../lib/helpers');

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
];

module.exports = { routes };
