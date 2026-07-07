const { json } = require('../lib/helpers');

const routes = [
  // Cities
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

  // Insurances
  { method: 'GET', pattern: '/api/v1/insurances/all', async handler(req, res) {
    json(res, 200, { data: [
      { id: 1, name: "Uniodonto", type: "Odontológico", status: true }, { id: 2, name: "Amil Dental", type: "Odontológico", status: true },
      { id: 3, name: "Bradesco Dental", type: "Odontológico", status: true }, { id: 4, name: "SulAmérica Odonto", type: "Odontológico", status: true },
    ]});
  }},

  // Laboratories
  { method: 'GET', pattern: '/api/v1/laboratories/all', async handler(req, res) {
    json(res, 200, { data: [
      { id: 1, name: "Lab Odonto SP", phone: "(11) 3123-4567" },
      { id: 2, name: "Prótese Dental Center", phone: "(11) 3234-5678" },
      { id: 3, name: "Lab Ultra Implantes", phone: "(11) 3345-6789" },
    ]});
  }},

  // Medicines
  { method: 'GET', pattern: '/api/v1/medicines/all', async handler(req, res) {
    json(res, 200, { data: [
      { id: 1, name: "Amoxicilina 500mg", supplier: "MedFarma" },
      { id: 2, name: "Ibuprofeno 600mg", supplier: "Genérico" },
      { id: 3, name: "Lidocaína 2%", supplier: "Anestech" },
    ]});
  }},
];

module.exports = { routes };
