import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import reactLogo from '../assets/react.svg';
import logo from '../assets/logo.svg';
import { TestComponents } from './test-components';
import './styles/global.css';

function App() {
  const queryClient = useQueryClient();

  return (
    <div className="bg-sky-50">
      <TestComponents />
      <a href="https://react.dev" target="_blank">
        <img src={reactLogo} className="logo react" alt="React logo" />
        <img src={logo} className="logo react" alt="React logo" />
      </a>

      <h1>Vite + React</h1>
      <div className="card">
        <button
          className="!bg-amber-300 py-2 px-6 rounded-2xl shadow-md transition duration-300"
          onClick={() =>
            void queryClient.invalidateQueries({ queryKey: ['get', '/users'] })
          }
        >
          invalidate
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </div>
  );
}

function Component() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools client={queryClient} />
    </QueryClientProvider>
  );
}

export default Component;
