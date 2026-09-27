import * as service from '../services/clientService.js';
export async function index(req,res){ res.json(await service.listClients(req.query)); }
export async function show(req,res){ res.json(await service.getClient(Number(req.params.id))); }
export async function store(req,res){ res.status(201).json(await service.createClient(req.body)); }
export async function update(req,res){ res.json(await service.updateClient(Number(req.params.id),req.body)); }
export async function updateStage(req,res){ res.json(await service.updateStage(Number(req.params.id),req.body.etapa_crm)); }
export async function destroy(req,res){ await service.removeClient(Number(req.params.id)); res.status(204).end(); }
