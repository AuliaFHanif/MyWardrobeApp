import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router";
import { useState, useEffect } from "react";
import Login from "./pages/LoginPage.jsx";
import Navbar from "./components/Navbar.jsx";
import PublicClothingItems from "./pages/PublicPage.jsx";
import ItemDetails from "./pages/PublicDetailPage.jsx";
import UserClothingItems from "./pages/UserClothingItems.jsx";
import AddItem from "./pages/CreateClothingItem.jsx";



function ProtectedLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}

function PublicLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route element={<PublicLayout />}>
          <Route path="/clothingItems" element={<PublicClothingItems />} />
          <Route path="/clothingItems/:id" element={<ItemDetails />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/clothingItems/myItems" element={<UserClothingItems />} />
          <Route path="/clothingItems/myItems/add" element={<AddItem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;