import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { CounterPage } from "./modules/counter/CounterPage";
import { DashboardPage } from "./modules/dashboard/DashboardPage";
import { FinancePage } from "./modules/finance/FinancePage";
import { PdvPage } from "./modules/pdv/PdvPage";
import { CategoriesPage } from "./modules/products/CategoriesPage";
import { ProductsPage } from "./modules/products/ProductsPage";
import { ReportsPage } from "./modules/reports/ReportsPage";
import { ModulePlaceholder } from "./modules/settings/ModulePlaceholder";
import { SettingsPage } from "./modules/settings/SettingsPage";
import { SngpcPage } from "./modules/sngpc/SngpcPage";
import { StockEntryPage } from "./modules/stock/StockEntryPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/balcao" element={<CounterPage />} />
        <Route path="/pdv" element={<PdvPage />} />
        <Route path="/estoque/entrada" element={<StockEntryPage />} />
        <Route path="/financeiro" element={<FinancePage />} />
        <Route path="/sngpc" element={<SngpcPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route
          path="/fiscal"
          element={
            <ModulePlaceholder
              moduleId="fiscal"
              title="Fiscal"
              description="NFC-e e documentos fiscais em modo mockado para demonstracao academica."
            />
          }
        />
        <Route
          path="/pbm"
          element={
            <ModulePlaceholder
              moduleId="pbm"
              title="Farmacia Popular / PBM"
              description="Fluxos de convenio e programas de desconto sem integracao real no MVP."
            />
          }
        />
        <Route
          path="/integracoes"
          element={
            <ModulePlaceholder
              moduleId="integracoes"
              title="Integracoes"
              description="Conectores externos planejados para XML, pagamentos, fiscal e PBM."
            />
          }
        />
        <Route
          path="/multiempresa"
          element={
            <ModulePlaceholder
              moduleId="multiempresa"
              title="Multiempresa"
              description="Estrutura futura para matriz, filiais, estoques por loja e permissoes."
            />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
