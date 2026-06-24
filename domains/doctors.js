const { json } = require('../lib/helpers');

const doctors = [
  { id: 1, name: "Dra. Maria da Costa", phone: "(11) 91234-5678", specialty: "Cirurgiã-Dentista", dentalOfficeId: 1 },
  { id: 2, name: "Dr. Carlos Oliveira", phone: "(11) 92345-6789", specialty: "Ortodontista", dentalOfficeId: 1 },
  { id: 3, name: "Dra. Ana Silva", phone: "(11) 93456-7890", specialty: "Periodontista", dentalOfficeId: 1 },
  { id: 4, name: "Dr. Roberto Lima", phone: "(11) 94567-8901", specialty: "Endodontista", dentalOfficeId: 1 },
  { id: 5, name: "Dra. Juliana Mendes", phone: "(11) 95678-9012", specialty: "Odontopediatra", dentalOfficeId: 1 },
];

const routes = [
  { method: 'GET', pattern: '/api/v1/doctors', async handler(req, res) {
    json(res, 200, { data: doctors });
  }},
  { method: 'GET', pattern: '/api/v1/doctors/select', async handler(req, res) {
    json(res, 200, doctors.map(d => ({ id: d.id, name: d.name })));
  }},
];

module.exports = { routes };
