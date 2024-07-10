import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
  },
  {
    path: '/stats/*',
  },
  {
    path: '/admin/*',
  },
  {
    path: '/login',
  },
  {
    path: '/user',
  },
  {
    path: '/room/:room',
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
