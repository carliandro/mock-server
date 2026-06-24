const { json, readBody } = require('../lib/helpers');

const patients = [
  { id: 1, name: "João Batista de Souza", lastName: "", gender: "MALE", dateOfBirth: "1990-05-15", cpf: "123.456.789-00", phone: "(11) 98765-4321", mobile: "(11) 91234-5678", email: "joao.souza@email.com", zipCode: "01310-100", street: "Av. Paulista", number: "1000", complement: "Apto 42", neighborhood: "Bela Vista", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", address: { zipCode: "01310-100", street: "Av. Paulista", number: "1000", complement: "Apto 42", neighborhood: "Bela Vista", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", cityId: 1 }, insurance: { insuranceId: 1, insuranceName: "Unimed", insuranceNumber: "1234567890", expirationDate: "2026-12-31", planCategory: "ENFERMARIA", planCompany: "Unimed Paulistana", planHolder: "João Batista de Souza", holderCpf: "123.456.789-00" }, insuranceProviderId: 1, insuranceProviderName: "Unimed", insurancePolicyNumber: "1234567890", insuranceExpirationDate: "2026-12-31", insuranceCategory: "ENFERMARIA", insuranceCompany: "Unimed Paulistana", planHolder: "João Batista de Souza", planHolderCpf: "123.456.789-00", status: "active", photo: null, dentalOfficeId: 1 },
  { id: 2, name: "Maria Aparecida Santos", lastName: "", gender: "FEMALE", dateOfBirth: "1985-08-22", cpf: "987.654.321-00", phone: "(11) 97654-3210", mobile: "(11) 99876-5432", email: "maria.santos@email.com", zipCode: "04547-000", street: "Rua Iguatemi", number: "500", complement: "", neighborhood: "Itaim Bibi", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", address: { zipCode: "04547-000", street: "Rua Iguatemi", number: "500", complement: "", neighborhood: "Itaim Bibi", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", cityId: 1 }, insurance: { insuranceId: 2, insuranceName: "Bradesco Saúde", insuranceNumber: "0987654321", expirationDate: "2026-06-30", planCategory: "APARTAMENTO", planCompany: "Bradesco Saúde", planHolder: "Maria Aparecida Santos", holderCpf: "987.654.321-00" }, insuranceProviderId: 2, insuranceProviderName: "Bradesco Saúde", insurancePolicyNumber: "0987654321", insuranceExpirationDate: "2026-06-30", insuranceCategory: "APARTAMENTO", insuranceCompany: "Bradesco Saúde", planHolder: "Maria Aparecida Santos", planHolderCpf: "987.654.321-00", status: "active", photo: null, dentalOfficeId: 1 },
  { id: 3, name: "Pedro Henrique Lima", lastName: "", gender: "MALE", dateOfBirth: "1978-03-10", cpf: "456.789.123-00", phone: "(11) 96543-2109", mobile: "(11) 98765-1234", email: "pedro.lima@email.com", zipCode: "01414-001", street: "Rua Augusta", number: "2500", complement: "Casa", neighborhood: "Consolação", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", address: { zipCode: "01414-001", street: "Rua Augusta", number: "2500", complement: "Casa", neighborhood: "Consolação", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", cityId: 1 }, insurance: { insuranceId: 3, insuranceName: "Amil", insuranceNumber: "5678901234", expirationDate: "2026-09-30", planCategory: "ENFERMARIA", planCompany: "Amil Assistência Médica", planHolder: "Pedro Henrique Lima", holderCpf: "456.789.123-00" }, insuranceProviderId: 3, insuranceProviderName: "Amil", insurancePolicyNumber: "5678901234", insuranceExpirationDate: "2026-09-30", insuranceCategory: "ENFERMARIA", insuranceCompany: "Amil Assistência Médica", planHolder: "Pedro Henrique Lima", planHolderCpf: "456.789.123-00", status: "active", photo: null, dentalOfficeId: 1 },
  { id: 4, name: "Ana Carolina Ferreira", lastName: "", gender: "FEMALE", dateOfBirth: "1995-11-28", cpf: "789.123.456-00", phone: "(11) 95432-1098", mobile: "(11) 97654-3210", email: "ana.ferreira@email.com", zipCode: "05422-001", street: "Rua Cardeal Arcoverde", number: "750", complement: "Apto 101", neighborhood: "Pinheiros", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", address: { zipCode: "05422-001", street: "Rua Cardeal Arcoverde", number: "750", complement: "Apto 101", neighborhood: "Pinheiros", city: "São Paulo", cityName: "São Paulo", uf: "SP", state: "São Paulo", stateName: "São Paulo", stateAbbreviation: "SP", cityId: 1 }, insurance: { insuranceId: 0, insuranceName: "Particular", insuranceNumber: "", expirationDate: null, planCategory: "", planCompany: "", planHolder: "", holderCpf: "" }, insuranceProviderId: 0, insuranceProviderName: "Particular", insurancePolicyNumber: "", insuranceExpirationDate: null, insuranceCategory: "", insuranceCompany: "", planHolder: "", planHolderCpf: "", status: "active", photo: null, dentalOfficeId: 1 },
];
let patientIdSeq = 100;

const routes = [
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
];

module.exports = { routes };
