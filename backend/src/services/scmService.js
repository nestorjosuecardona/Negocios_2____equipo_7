import * as repo from '../repositories/scmRepository.js';
export const getScmSummary = repo.getScmSummary;
export const listSuppliers = repo.listSuppliers;
export const listProducts = repo.listProducts;
export const listInventory = repo.listInventory;
export const listOrders = repo.listOrders;
export async function createSupplier(data) {
  if(!data.nombre?.trim()){const e=new Error('El nombre del proveedor es obligatorio.');e.status=400;throw e;}
  return repo.createSupplier(data);
}
export async function createProduct(data) {
  if(!data.nombre?.trim() || !data.sku?.trim()){const e=new Error('Nombre y SKU son obligatorios.');e.status=400;throw e;}
  return repo.createProduct(data);
}
