import './styles/index.css';
import { Outlet } from 'react-router-dom';

/*TODO
 *  [] imports order
 *  [] add errors types for api and client, common lib?
 *  [] сейчас на клиент тянется библиотека exceptions так есть импорты с nest/core что очень не желательно
 *     сейчас берутся только тайпгарды, но можно ненаромо зацепть лишнего и уронить фронт, vite при билде
 *     ворнингует на это. как вариант, вынести тайпгарды в отдельную либу и использовать zod схемы
 *  []
 * */
export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Outlet />
    </div>
  );
}
