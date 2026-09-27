import { Link } from 'react-router-dom';
export default function NotFound(){return <div className="not-found"><h1>404</h1><p>La página no existe.</p><Link className="btn btn-primary" to="/dashboard">Volver al dashboard</Link></div>}
