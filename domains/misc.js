const { json, readBody } = require('../lib/helpers');

const cities = [
  { id: 1, name: "São Paulo", state: "SP" }, { id: 2, name: "Campinas", state: "SP" },
  { id: 3, name: "Ribeirão Preto", state: "SP" }, { id: 4, name: "São Bernardo do Campo", state: "SP" },
  { id: 5, name: "Santo André", state: "SP" }, { id: 6, name: "Osasco", state: "SP" },
  { id: 7, name: "Sorocaba", state: "SP" }, { id: 8, name: "Mauá", state: "SP" },
  { id: 9, name: "São José dos Campos", state: "SP" }, { id: 10, name: "Guarulhos", state: "SP" },
  { id: 11, name: "Rio de Janeiro", state: "RJ" }, { id: 12, name: "Niterói", state: "RJ" },
  { id: 13, name: "Duque de Caxias", state: "RJ" },
];

const laboratories = [
  { id: 1, laboratoryName: "Lab Odonto SP", speciality: "Prótese Dentária", phone: "(11) 3123-4567", extraPhone: "", technical: "Carlos", cpfCnpj: "12.345.678/0001-90", contactEmail: "lab@odontosp.com.br", active: true },
  { id: 2, laboratoryName: "Prótese Dental Center", speciality: "Prótese Fixa", phone: "(11) 3234-5678", extraPhone: "", technical: "Ana", cpfCnpj: "98.765.432/0001-10", contactEmail: "contato@protesecenter.com.br", active: true },
  { id: 3, laboratoryName: "Lab Ultra Implantes", speciality: "Implantes", phone: "(11) 3345-6789", extraPhone: "", technical: "Roberto", cpfCnpj: "45.678.901/0001-23", contactEmail: "vendas@ultraimplantes.com.br", active: true },
];
let laboratoryIdSeq = 100;

const routes = [
  // Cities
  { method: 'GET', pattern: '/api/v1/cities', async handler(req, res) {
    json(res, 200, { data: cities });
  }},
  { method: 'POST', pattern: '/api/v1/cities', async handler(req, res) {
    const body = await readBody(req);
    const query = (body.query || '').toLowerCase();
    const filtered = cities.filter(c =>
      query.includes(c.name.toLowerCase()) || query.includes(c.state.toLowerCase())
    );
    json(res, 200, { data: filtered });
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
    json(res, 200, laboratories);
  }},
  { method: 'POST', pattern: '/api/v1/laboratories', async handler(req, res) {
    const body = await readBody(req);
    const newLab = { id: ++laboratoryIdSeq, ...body };
    laboratories.push(newLab);
    json(res, 201, newLab);
  }},
  { method: 'PUT', pattern: '/api/v1/laboratories/:id', async handler(req, res, params) {
    const body = await readBody(req);
    const idx = laboratories.findIndex(l => l.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    laboratories[idx] = { ...laboratories[idx], ...body, id: Number(params.id) };
    json(res, 200, laboratories[idx]);
  }},
  { method: 'DELETE', pattern: '/api/v1/laboratories/:id', async handler(req, res, params) {
    const idx = laboratories.findIndex(l => l.id === Number(params.id));
    if (idx === -1) { json(res, 404, { error: 'Not found' }); return; }
    laboratories.splice(idx, 1);
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
    res.end();
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
