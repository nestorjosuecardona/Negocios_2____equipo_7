import { Inbox } from 'lucide-react';
export default function EmptyState({text='No hay registros todavía.'}){return <div className="empty-state"><Inbox size={30}/><p>{text}</p></div>}
