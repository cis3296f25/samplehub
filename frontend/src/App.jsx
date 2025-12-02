import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Components/Layout";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";
import RandomYoutube from "./Pages/RandomYoutube";
import Auth from "./Pages/Auth";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="discover" element={<RandomYoutube />} />
        <Route path="auth" element={<Auth />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
