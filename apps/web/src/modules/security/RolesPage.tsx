import {
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ActionButton } from "../../components/ui/ActionButton";
import { FormField, inputClassName } from "../../components/ui/FormField";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";

type PermissionAction = "view" | "create" | "edit" | "delete";

interface PermissionActionConfig {
  key: PermissionAction;
  label: string;
  icon: LucideIcon;
}

interface RolePermission {
  serviceId: string;
  serviceName: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface RoleAccess {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
}

const permissionActions: PermissionActionConfig[] = [
  { key: "view", label: "Ver", icon: Eye },
  { key: "create", label: "Incluir", icon: Plus },
  { key: "edit", label: "Editar", icon: Pencil },
  { key: "delete", label: "Excluir", icon: Trash2 },
];

const services = [
  "Acesso ao sistema",
  "Ajustar Campos Produto Cadastro",
  "Ajustar Saldo Estoque",
  "Ajustar Saldo Estoque Fiscal",
  "Ajustar Regras",
  "Ajustar Preco",
  "Alterar Senha",
  "Atualizar Tabelas e Campos",
  "Boleto",
  "CFOP",
  "CTe",
  "CTe-OS",
  "Informar Faltas",
  "Solicitar reposicao",
  "Configuracao",
  "Config. Fiscais",
  "Contador",
  "Contas",
  "Contas a Pagar",
  "Contas a Receber",
  "Contatos",
  "Curva ABC",
  "Devolucao de Compra",
  "Devolucao de Venda",
  "Empresa",
  "Referencias",
  "Fabricantes",
  "Marcas",
  "Fornecedores",
  "Clientes",
  "Colaboradores",
  "Financeiro",
  "SNGPC",
  "Relatorios",
  "Fiscal",
  "PBM",
];

function serviceId(serviceName: string) {
  return serviceName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makePermissions(defaults: Partial<Record<PermissionAction, boolean>>): RolePermission[] {
  return services.map((serviceName) => ({
    serviceId: serviceId(serviceName),
    serviceName,
    view: defaults.view ?? false,
    create: defaults.create ?? false,
    edit: defaults.edit ?? false,
    delete: defaults.delete ?? false,
  }));
}

const initialRoles: RoleAccess[] = [
  {
    id: "cargo-administrador",
    name: "Administrador",
    description: "Acesso completo para configuracao, cadastros e operacao.",
    permissions: makePermissions({ view: true, create: true, edit: true, delete: true }),
  },
  {
    id: "cargo-farmaceutico",
    name: "Farmaceutico RT",
    description: "Acesso operacional com foco em SNGPC, fiscal e regras de produto.",
    permissions: makePermissions({ view: true, create: true, edit: true, delete: false }),
  },
  {
    id: "cargo-caixa",
    name: "Caixa",
    description: "Acesso de venda, atendimento, clientes e financeiro basico.",
    permissions: makePermissions({ view: true, create: false, edit: false, delete: false }),
  },
];

function countAllowedActions(role: RoleAccess) {
  return role.permissions.reduce(
    (total, permission) =>
      total +
      permissionActions.filter((action) => permission[action.key]).length,
    0,
  );
}

function makeRoleId(name: string) {
  return `cargo-${serviceId(name)}-${Date.now().toString(36)}`;
}

export function RolesPage() {
  const [roles, setRoles] = useState<RoleAccess[]>(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoles[0].id);
  const [newRoleName, setNewRoleName] = useState("");

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0]!;
  const totalPossibleActions = services.length * permissionActions.length;
  const selectedAllowedActions = countAllowedActions(selectedRole);

  const rolesWithFullAccess = useMemo(
    () => roles.filter((role) => countAllowedActions(role) === totalPossibleActions).length,
    [roles, totalPossibleActions],
  );

  function createRole(event: FormEvent) {
    event.preventDefault();

    const name = newRoleName.trim();
    if (!name) return;

    const role: RoleAccess = {
      id: makeRoleId(name),
      name,
      description: "Cargo criado para parametrizacao de acesso.",
      permissions: makePermissions({ view: false, create: false, edit: false, delete: false }),
    };

    setRoles((current) => [role, ...current]);
    setSelectedRoleId(role.id);
    setNewRoleName("");
  }

  function togglePermission(service: string, action: PermissionAction) {
    setRoles((current) =>
      current.map((role) =>
        role.id === selectedRole.id
          ? {
              ...role,
              permissions: role.permissions.map((permission) =>
                permission.serviceId === service
                  ? { ...permission, [action]: !permission[action] }
                  : permission,
              ),
            }
          : role,
      ),
    );
  }

  return (
    <section>
      <PageHeader
        eyebrow="Sistema"
        title="Cargos"
        description="Controle quais cargos podem visualizar, incluir, editar ou excluir telas e servicos do ERP."
      />

      <div className="space-y-5 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={UserCog}
            label="Cargos cadastrados"
            value={roles.length}
            detail="Perfis usados no cadastro de colaboradores"
            tone="green"
          />
          <StatCard
            icon={ShieldCheck}
            label="Servicos controlados"
            value={services.length}
            detail="Itens disponiveis na matriz de permissao"
            tone="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Cargos com acesso total"
            value={rolesWithFullAccess}
            detail="Permissoes completas em todos os servicos"
            tone="amber"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <form className="rounded-md border border-slate-200 bg-white p-4 shadow-sm" onSubmit={createRole}>
              <FormField label="Novo cargo">
                <input
                  className={inputClassName}
                  placeholder="Ex: Estoquista"
                  value={newRoleName}
                  onChange={(event) => setNewRoleName(event.target.value)}
                />
              </FormField>
              <ActionButton className="mt-3 w-full" icon={Plus} type="submit" variant="primary">
                Criar cargo
              </ActionButton>
            </form>

            <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <p className="px-1 text-xs font-semibold uppercase text-slate-500">Cargos</p>
              <div className="mt-3 space-y-2">
                {roles.map((role) => {
                  const selected = role.id === selectedRole.id;

                  return (
                    <button
                      key={role.id}
                      className={[
                        "w-full rounded-md border px-3 py-3 text-left transition",
                        selected
                          ? "border-pharma-500 bg-pharma-50 text-pharma-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-pharma-200 hover:bg-slate-50",
                      ].join(" ")}
                      type="button"
                      onClick={() => setSelectedRoleId(role.id)}
                    >
                      <span className="block text-sm font-semibold">{role.name}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {countAllowedActions(role)} de {totalPossibleActions} permissoes ativas
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{selectedRole.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedRole.description}</p>
                </div>
                <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                  {selectedAllowedActions} / {totalPossibleActions}
                </div>
              </div>
            </div>

            <div className="max-h-[620px] overflow-auto erp-scrollbar">
              <table className="min-w-[760px] divide-y divide-slate-200 text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                      Servico
                    </th>
                    {permissionActions.map((action) => (
                      <th
                        key={action.key}
                        className="w-28 px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500"
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <action.icon className="h-4 w-4" aria-hidden="true" />
                          {action.label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedRole.permissions.map((permission) => (
                    <tr key={permission.serviceId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{permission.serviceName}</td>
                      {permissionActions.map((action) => (
                        <td key={action.key} className="px-4 py-3 text-center">
                          <input
                            aria-label={`${action.label} ${permission.serviceName}`}
                            checked={permission[action.key]}
                            className="h-4 w-4 rounded border-slate-300 text-pharma-600 focus:ring-pharma-500"
                            type="checkbox"
                            onChange={() => togglePermission(permission.serviceId, action.key)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

