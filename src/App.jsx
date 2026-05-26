import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import useAuthStore from "./store/authStore";

import ProtectedRoute from "./components/layout/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import SinAcceso from "./pages/auth/SinAcceso";
import RedireccionarInicio from "./pages/auth/RedireccionarInicio";

import SuperadminPage from "./pages/superadmin/SuperadminPage";
import DirectorPage from "./pages/director/DirectorPage";
import SecretariaPage from "./pages/secretaria/SecretariaPage";
import FinanzasPage from "./pages/finanzas/FinanzasPage";

import OperativoPage from "./pages/operativo/OperativoPage";
import EnfermeriaPage from "./pages/operativo/EnfermeriaPage";

import LogisticaPage from "./pages/logistica/LogisticaPage";
import MarketingPage from "./pages/marketing/MarketingPage";
import PadrePage from "./pages/padre/PadrePage";


export default function App() {
  const inicializar = useAuthStore((s) => s.inicializar);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/sin-acceso" element={<SinAcceso />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RedireccionarInicio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/*"
          element={
            <ProtectedRoute rolesPermitidos={["SUPERADMIN"]}>
              <SuperadminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/director/*"
          element={
            <ProtectedRoute rolesPermitidos={["DIRECTOR", "SUPERADMIN"]}>
              <DirectorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secretaria/*"
          element={
            <ProtectedRoute rolesPermitidos={["SECRETARIA", "SUPERADMIN"]}>
              <SecretariaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finanzas/*"
          element={
            <ProtectedRoute rolesPermitidos={["FINANZAS", "SECRETARIA", "SUPERADMIN"]}>
              <FinanzasPage />
            </ProtectedRoute>
          }
        />

        {/* ENFERMERÍA */}
        <Route
          path="/operativo/enfermeria"
          element={
            <ProtectedRoute rolesPermitidos={["ENFERMERIA", "SUPERADMIN", "DIRECTOR"]}>
              <EnfermeriaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/operativo/medicamentos"
          element={
            <ProtectedRoute rolesPermitidos={["ENFERMERIA", "SUPERADMIN", "DIRECTOR"]}>
              <EnfermeriaPage />
            </ProtectedRoute>
          }
        />

        {/* MAESTRO / OPERATIVO */}
        <Route
          path="/operativo/*"
          element={
            <ProtectedRoute rolesPermitidos={["MAESTRO", "SUPERADMIN", "DIRECTOR"]}>
              <OperativoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logistica/*"
          element={
            <ProtectedRoute rolesPermitidos={["CHOFER", "SUPERADMIN", "DIRECTOR"]}>
              <LogisticaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketing/*"
          element={
            <ProtectedRoute rolesPermitidos={["MARKETING", "VENTAS", "SUPERADMIN"]}>
              <MarketingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/padre/*"
          element={
            <ProtectedRoute rolesPermitidos={["REPRESENTANTE"]}>
              <PadrePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}