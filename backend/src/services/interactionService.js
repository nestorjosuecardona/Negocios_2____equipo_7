import * as repo from '../repositories/interactionRepository.js';
import { findClientById } from '../repositories/clientRepository.js';

const types = ['Llamada','Correo','Reunión','Otro'];
export const listInteractions = repo.listInteractions;
export const listClientInteractions = repo.listClientInteractions;
export const listUserActivity = repo.listUserActivity;

export async function createInteraction(data) {
  if (!data.cliente_id || !data.descripcion?.trim() || !types.includes(data.tipo)) {
    const e = new Error('Cliente, tipo y descripción son obligatorios.'); e.status=400; throw e;
  }
  if (!(await findClientById(data.cliente_id))) { const e=new Error('Cliente no encontrado.');e.status=404;throw e; }
  return repo.createInteraction(data);
}
