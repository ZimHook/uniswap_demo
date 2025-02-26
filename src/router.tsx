import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import Trade from "./pages/Trade"
import Liquidity from "./pages/Liquidity"
import History from "./pages/History"
import Balance from "./pages/Balance"

const routes = [{
  path: '/',
    element: <Layout />,  
    children: [{
      path: 'trade',
      element: <Trade />,
    },
    {
      path: 'liquidity',
      element: <Liquidity />,
    },      
    {
      path: 'history',
      element: <History />,
    },
    {
      path: 'balance',
      element: <Balance />,
    },
    {
      path: '*',
      element: <Navigate to='/trade' />
    }]
}
]

const renderRoutes = (routes) => {
  return(
    <>
      {routes.map((item, index) => {
        if(item.children){
          return <Route path={item.path} element={item.element} key={index + item.path}>
            {renderRoutes(item.children)}
          </Route>
        }
        return <Route path={item.path} element={item.element} key={index + item.path}/>
      })}
    </>
  )
}

const Router = () => {
  
  return (
    <BrowserRouter>
      <Routes>
        {renderRoutes(routes)}
      </Routes>
    </BrowserRouter>
  )
}

export default Router
