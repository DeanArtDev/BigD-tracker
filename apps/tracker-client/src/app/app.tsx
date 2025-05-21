import './styles/index.css';
import { Outlet } from 'react-router-dom';

/*TODO
 *  [] imports order
 *  [] add errors types for api and client, common lib?
 *  []
 *  []
 * */
export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Outlet />
    </div>
  );
}
