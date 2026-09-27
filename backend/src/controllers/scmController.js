import * as s from '../services/scmService.js';
export async function summary(req,res){res.json(await s.getScmSummary());}
export async function suppliers(req,res){res.json(await s.listSuppliers());}
export async function createSupplier(req,res){res.status(201).json(await s.createSupplier(req.body));}
export async function products(req,res){res.json(await s.listProducts());}
export async function createProduct(req,res){res.status(201).json(await s.createProduct(req.body));}
export async function inventory(req,res){res.json(await s.listInventory());}
export async function orders(req,res){res.json(await s.listOrders());}
