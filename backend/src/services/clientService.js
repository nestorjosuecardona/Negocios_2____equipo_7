import * as repo from '../repositories/clientRepository.js';

const validStates = ['activo','inactivo'];
const validStages = ['Prospecto','Activo','Frecuente','Inactivo'];

function validate(data) {
  if (!data.nombre?.trim()) { const e=new Error('El nombre es obligatorio.'); e.status=400; throw e; }
  if (data.estado && !validStates.includes(data.estado)) { const e=new Error('Estado no válido.'); e.status=400; throw e; }
  if (data.etapa_crm && !validStages.includes(data.etapa_crm)) { const e=new Error('Etapa CRM no válida.'); e.status=400; throw e; }
}

export const listClients = repo.listClients;
export async function getClient(id) {
  const item = await repo.findClientById(id);
  if (!item) { const e=new Error('Cliente no encontrado.'); e.status=404; throw e; }
  return item;
}
export async function createClient(data) { validate(data); return repo.createClient(data); }
export async function updateClient(id, data) { validate(data); const x=await repo.updateClient(id,data); if(!x){const e=new Error('Cliente no encontrado.');e.status=404;throw e;} return x; }
export async function updateStage(id, etapa) {
  if(!validStages.includes(etapa)){const e=new Error('Etapa CRM no válida.');e.status=400;throw e;}
  const x=await repo.updateClientStage(id,etapa); if(!x){const e=new Error('Cliente no encontrado.');e.status=404;throw e;} return x;
}
export async function removeClient(id) { const x=await repo.deleteClient(id); if(!x){const e=new Error('Cliente no encontrado.');e.status=404;throw e;} return x; }
