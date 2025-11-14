import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Code from './pages/Code/Code.jsx';
import Cadastro from './pages/Cadastro/Cadastro.jsx';
import CadastroTask from './pages/CadastroTask/CadastroTask.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,

    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "code",
        element: <Code />,
      },{
        path: "cadastro",
        element: <Cadastro/>,
      },{
        path: "CadastroTask",
        element: <CadastroTask/>,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);