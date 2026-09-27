import * as service from '../services/interactionService.js';
export async function index(req,res){ res.json(await service.listInteractions()); }
export async function byClient(req,res){ res.json(await service.listClientInteractions(Number(req.params.id))); }
export async function store(req,res){ res.status(201).json(await service.createInteraction({...req.body,usuario_id:req.user.id})); }
export async function myActivity(req,res){ res.json(await service.listUserActivity(req.user.id)); }
