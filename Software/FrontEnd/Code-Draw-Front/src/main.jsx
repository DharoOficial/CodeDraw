import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Code from './pages/Code/Code.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // <== O App é o elemento principal
    // errorElement: <ErrorPage />, // Boa prática: adicione uma página de erro
    children: [ // <== As outras rotas são "filhas" dele e serão renderizadas no <Outlet />
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "login", // Não precisa da "/" no início em rotas aninhadas
        element: <Login />,
      },
      {
        path: "code", // Dica: por convenção, use caminhos em minúsculo
        element: <Code />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);