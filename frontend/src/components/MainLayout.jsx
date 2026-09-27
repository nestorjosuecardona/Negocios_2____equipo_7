import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
export default function MainLayout({children}){const [open,setOpen]=useState(false);return <div className="app-shell"><Sidebar open={open} onClose={()=>setOpen(false)}/><div className="app-main"><Topbar onMenu={()=>setOpen(true)}/><main className="page-container">{children}</main></div><div className={`sidebar-backdrop ${open?'show':''}`} onClick={()=>setOpen(false)}></div></div>}
