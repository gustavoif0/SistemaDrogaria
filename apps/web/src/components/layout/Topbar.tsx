import { Bell, HelpCircle, LogOut, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { usePharma } from "../../store/PharmaContext";
import { ActionButton } from "../ui/ActionButton";

export function Topbar() {
  const { company, currentUser, stockAlerts, preSales } = usePharma();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const pendingPreSales = preSales.filter((preSale) => preSale.status === "sent_to_cashier").length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <ActionButton aria-label="Abrir menu" compact icon={Menu} variant="ghost" className="lg:hidden" />
        <div className="hidden h-10 w-80 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 md:flex">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span className="text-sm text-slate-500">Buscar produto, cliente ou venda</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{company.name}</p>
          <p className="truncate text-xs text-slate-500">{company.storeName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
          <p className="text-xs text-slate-500">
            {now.toLocaleDateString("pt-BR")} {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <ActionButton
          aria-label={`${stockAlerts.length + pendingPreSales} notificacoes`}
          compact
          icon={Bell}
          variant="ghost"
          title={`${stockAlerts.length} alertas de estoque, ${pendingPreSales} pre-vendas`}
        />
        <ActionButton aria-label="Suporte" compact icon={HelpCircle} variant="ghost" title="Suporte" />
        <ActionButton aria-label="Sair" compact icon={LogOut} variant="ghost" title="Sair" />
      </div>
    </header>
  );
}
