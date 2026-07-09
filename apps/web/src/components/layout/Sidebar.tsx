import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  FileCog,
  FileText,
  Gauge,
  GitBranch,
  HandCoins,
  LayoutDashboard,
  PackagePlus,
  Pill,
  ReceiptText,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  UserCog,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const groups = [
  {
    label: "Operacao",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Produtos", to: "/produtos", icon: Pill },
      { label: "Categorias", to: "/categorias", icon: Tags },
      { label: "Atendimento", to: "/balcao", icon: HandCoins },
      { label: "PDV / Caixa", to: "/pdv", icon: ShoppingCart },
      { label: "Entrada XML", to: "/estoque/entrada", icon: PackagePlus },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { label: "Referencias", to: "/referencias", icon: ClipboardList },
      { label: "Fabricantes", to: "/fabricantes", icon: Building2 },
      { label: "Marcas", to: "/marcas", icon: Tags },
      { label: "Fornecedores", to: "/fornecedores", icon: Store },
      { label: "Clientes", to: "/clientes", icon: Users },
      { label: "Colaboradores", to: "/colaboradores", icon: UserCog },
    ],
  },
  {
    label: "Gestao",
    items: [
      { label: "Financeiro", to: "/financeiro", icon: CreditCard },
      { label: "SNGPC", to: "/sngpc", icon: ClipboardList },
      { label: "Relatorios", to: "/relatorios", icon: BarChart3 },
      { label: "Fiscal", to: "/fiscal", icon: ReceiptText },
      { label: "PBM", to: "/pbm", icon: FileText },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Configuracoes", to: "/configuracoes", icon: Settings },
      { label: "Integracoes", to: "/integracoes", icon: GitBranch },
      { label: "Multiempresa", to: "/multiempresa", icon: Building2 },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-pharma-500">
          <Store className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-semibold">PharmaERP</p>
          <p className="text-xs text-slate-300">Drogaria SaaS MVP</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 erp-scrollbar">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-slate-400">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                      isActive
                        ? "bg-pharma-500 text-white"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-md border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Gauge className="h-4 w-4 text-pharma-100" aria-hidden="true" />
            MVP academico
          </div>
          <p className="mt-1 text-xs text-slate-300">Fiscal, SNGPC e PBM em modo mockado.</p>
        </div>
      </div>
    </aside>
  );
}
