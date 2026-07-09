import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Plus,
  Save,
  Search,
  Store,
  Tags,
  UserCog,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ActionButton } from "../../components/ui/ActionButton";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { FormField, inputClassName, textareaClassName } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { usePharma } from "../../store/PharmaContext";
import type { MasterDataKind, MasterDataRecord, ProductStatus } from "../../types/domain";

type MasterDataFormState = Omit<MasterDataRecord, "id">;
type TextFieldKey = Exclude<keyof MasterDataFormState, "status">;
type StatusFilter = ProductStatus | "all";

interface MasterDataField {
  key: TextFieldKey;
  label: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  placeholder?: string;
  span?: "full";
}

interface MasterDataConfig {
  kind: MasterDataKind;
  title: string;
  singular: string;
  description: string;
  addLabel: string;
  emptyMessage: string;
  icon: LucideIcon;
  roleLabel: string;
  contactLabel: string;
  fields: MasterDataField[];
}

const emptyForm: MasterDataFormState = {
  code: "",
  name: "",
  document: "",
  contactName: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  role: "",
  notes: "",
  status: "active",
};

const sharedContactFields: MasterDataField[] = [
  { key: "document", label: "Documento" },
  { key: "contactName", label: "Contato" },
  { key: "phone", label: "Telefone", type: "tel" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "UF", placeholder: "AM" },
  { key: "notes", label: "Observacoes", span: "full" },
];

const configs: Record<MasterDataKind, MasterDataConfig> = {
  references: {
    kind: "references",
    title: "Referencias",
    singular: "referencia",
    description: "Padroes internos usados para agrupar produtos, similares e genericos.",
    addLabel: "Nova referencia",
    emptyMessage: "Nenhuma referencia cadastrada.",
    icon: ClipboardList,
    roleLabel: "Grupo",
    contactLabel: "Resumo",
    fields: [
      { key: "code", label: "Codigo", placeholder: "REF-001" },
      { key: "name", label: "Nome da referencia", required: true },
      { key: "role", label: "Grupo terapeutico" },
      { key: "contactName", label: "Descricao curta" },
      { key: "notes", label: "Observacoes", span: "full" },
    ],
  },
  manufacturers: {
    kind: "manufacturers",
    title: "Fabricantes",
    singular: "fabricante",
    description: "Laboratorios e fabricantes associados ao cadastro de produtos.",
    addLabel: "Novo fabricante",
    emptyMessage: "Nenhum fabricante cadastrado.",
    icon: Building2,
    roleLabel: "Tipo",
    contactLabel: "Contato",
    fields: [
      { key: "code", label: "Codigo", placeholder: "FAB-001" },
      { key: "name", label: "Nome do fabricante", required: true },
      { key: "role", label: "Tipo" },
      ...sharedContactFields,
    ],
  },
  brands: {
    kind: "brands",
    title: "Marcas",
    singular: "marca",
    description: "Marcas comerciais usadas para organizar o portfolio de produtos.",
    addLabel: "Nova marca",
    emptyMessage: "Nenhuma marca cadastrada.",
    icon: Tags,
    roleLabel: "Segmento",
    contactLabel: "Detentor",
    fields: [
      { key: "code", label: "Codigo", placeholder: "MAR-001" },
      { key: "name", label: "Nome da marca", required: true },
      { key: "role", label: "Segmento" },
      { key: "contactName", label: "Detentor ou linha" },
      { key: "city", label: "Cidade" },
      { key: "state", label: "UF", placeholder: "AM" },
      { key: "notes", label: "Observacoes", span: "full" },
    ],
  },
  suppliers: {
    kind: "suppliers",
    title: "Fornecedores",
    singular: "fornecedor",
    description: "Parceiros comerciais para compras, entrada XML e reposicao de estoque.",
    addLabel: "Novo fornecedor",
    emptyMessage: "Nenhum fornecedor cadastrado.",
    icon: Store,
    roleLabel: "Tipo",
    contactLabel: "Contato",
    fields: [
      { key: "code", label: "Codigo", placeholder: "FOR-001" },
      { key: "name", label: "Razao social ou nome fantasia", required: true },
      { key: "role", label: "Tipo" },
      ...sharedContactFields,
    ],
  },
  customers: {
    kind: "customers",
    title: "Clientes",
    singular: "cliente",
    description: "Clientes para venda identificada, crediario e relacionamento comercial.",
    addLabel: "Novo cliente",
    emptyMessage: "Nenhum cliente cadastrado.",
    icon: Users,
    roleLabel: "Perfil",
    contactLabel: "Contato",
    fields: [
      { key: "code", label: "Codigo", placeholder: "CLI-001" },
      { key: "name", label: "Nome do cliente", required: true },
      { key: "document", label: "CPF/CNPJ" },
      { key: "role", label: "Perfil" },
      { key: "phone", label: "Telefone", type: "tel" },
      { key: "email", label: "E-mail", type: "email" },
      { key: "city", label: "Cidade" },
      { key: "state", label: "UF", placeholder: "AM" },
      { key: "notes", label: "Observacoes", span: "full" },
    ],
  },
  employees: {
    kind: "employees",
    title: "Colaboradores",
    singular: "colaborador",
    description: "Equipe operacional, cargos e contatos internos da drogaria.",
    addLabel: "Novo colaborador",
    emptyMessage: "Nenhum colaborador cadastrado.",
    icon: UserCog,
    roleLabel: "Cargo",
    contactLabel: "Contato",
    fields: [
      { key: "code", label: "Codigo", placeholder: "COL-001" },
      { key: "name", label: "Nome do colaborador", required: true },
      { key: "document", label: "CPF" },
      { key: "role", label: "Cargo" },
      { key: "phone", label: "Telefone", type: "tel" },
      { key: "email", label: "E-mail", type: "email" },
      { key: "city", label: "Cidade" },
      { key: "state", label: "UF", placeholder: "AM" },
      { key: "notes", label: "Observacoes", span: "full" },
    ],
  },
};

function statusLabel(status: ProductStatus) {
  return status === "active" ? "Ativo" : "Inativo";
}

function optionalText(value: string) {
  return value.trim() || "Nao informado";
}

function normalizeForm(form: MasterDataFormState): MasterDataFormState {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    document: form.document.trim(),
    contactName: form.contactName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    role: form.role.trim(),
    notes: form.notes.trim(),
    status: form.status,
  };
}

function buildSearchText(record: MasterDataRecord) {
  return [
    record.code,
    record.name,
    record.document,
    record.contactName,
    record.phone,
    record.email,
    record.city,
    record.state,
    record.role,
    record.notes,
  ]
    .join(" ")
    .toLowerCase();
}

function MasterDataPage({ config }: { config: MasterDataConfig }) {
  const { masterData, addMasterDataRecord, updateMasterDataRecord } = usePharma();
  const records = masterData[config.kind];
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterDataRecord | null>(null);
  const [form, setForm] = useState<MasterDataFormState>(emptyForm);

  const filteredRecords = useMemo(() => {
    const term = query.trim().toLowerCase();

    return records.filter((record) => {
      const statusMatches = statusFilter === "all" || record.status === statusFilter;
      const textMatches = !term || buildSearchText(record).includes(term);

      return statusMatches && textMatches;
    });
  }, [query, records, statusFilter]);

  const activeCount = records.filter((record) => record.status === "active").length;
  const inactiveCount = records.length - activeCount;

  function updateForm<K extends keyof MasterDataFormState>(key: K, value: MasterDataFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openNewRecord() {
    setEditingRecord(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditRecord(record: MasterDataRecord) {
    setEditingRecord(record);
    setForm({
      code: record.code,
      name: record.name,
      document: record.document,
      contactName: record.contactName,
      phone: record.phone,
      email: record.email,
      city: record.city,
      state: record.state,
      role: record.role,
      notes: record.notes,
      status: record.status,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingRecord(null);
    setForm(emptyForm);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload = normalizeForm(form);
    if (!payload.name) return;

    if (editingRecord) {
      updateMasterDataRecord(config.kind, editingRecord.id, payload);
    } else {
      addMasterDataRecord(config.kind, payload);
    }

    closeModal();
  }

  return (
    <section>
      <PageHeader
        eyebrow="Cadastros"
        title={config.title}
        description={config.description}
        actions={
          <ActionButton icon={Plus} onClick={openNewRecord} variant="primary">
            {config.addLabel}
          </ActionButton>
        }
      />

      <div className="space-y-5 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={config.icon}
            label={`Total de ${config.title.toLowerCase()}`}
            value={records.length}
            detail={`${filteredRecords.length} registro(s) na visualizacao atual`}
            tone="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Ativos"
            value={activeCount}
            detail="Disponiveis para operacao"
            tone="green"
          />
          <StatCard
            icon={XCircle}
            label="Inativos"
            value={inactiveCount}
            detail="Mantidos apenas para historico"
            tone="slate"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
          <FormField label="Buscar">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputClassName} pl-9`}
                placeholder={`Buscar em ${config.title.toLowerCase()}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </FormField>
          <FormField label="Status">
            <select
              className={inputClassName}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </FormField>
        </div>

        <DataTable
          data={filteredRecords}
          emptyMessage={config.emptyMessage}
          getRowKey={(record) => record.id}
          columns={[
            {
              header: "Codigo",
              render: (record) => <span className="font-medium text-slate-900">{optionalText(record.code)}</span>,
            },
            {
              header: config.singular,
              render: (record) => (
                <div>
                  <p className="font-semibold text-slate-900">{record.name}</p>
                  {record.notes ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{record.notes}</p> : null}
                </div>
              ),
            },
            {
              header: config.roleLabel,
              render: (record) => optionalText(record.role),
            },
            {
              header: config.contactLabel,
              render: (record) => (
                <div>
                  <p className="text-slate-700">{optionalText(record.contactName || record.phone)}</p>
                  {record.email ? <p className="mt-1 text-xs text-slate-500">{record.email}</p> : null}
                </div>
              ),
            },
            {
              header: "Local",
              render: (record) =>
                record.city || record.state ? `${record.city}${record.city && record.state ? " / " : ""}${record.state}` : "Nao informado",
            },
            {
              header: "Status",
              render: (record) => (
                <BadgeStatus tone={record.status === "active" ? "success" : "neutral"}>
                  {statusLabel(record.status)}
                </BadgeStatus>
              ),
            },
            {
              header: "Acoes",
              align: "right",
              render: (record) => (
                <ActionButton compact icon={Pencil} onClick={() => openEditRecord(record)}>
                  Editar
                </ActionButton>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={editingRecord ? `Editar ${config.singular}` : config.addLabel}
        description="Mantenha os dados cadastrais consistentes para uso nos fluxos operacionais."
        open={modalOpen}
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={closeModal}>Cancelar</ActionButton>
            <ActionButton form={`${config.kind}-form`} icon={Save} type="submit" variant="primary">
              Salvar
            </ActionButton>
          </div>
        }
      >
        <form id={`${config.kind}-form`} className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {config.fields.map((field) => (
            <div key={field.key} className={field.span === "full" ? "md:col-span-2" : undefined}>
              <FormField label={field.label}>
                {field.key === "notes" ? (
                  <textarea
                    className={textareaClassName}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(event) => updateForm(field.key, event.target.value)}
                  />
                ) : (
                  <input
                    className={inputClassName}
                    placeholder={field.placeholder}
                    required={field.required}
                    type={field.type ?? "text"}
                    value={form[field.key]}
                    onChange={(event) => updateForm(field.key, event.target.value)}
                  />
                )}
              </FormField>
            </div>
          ))}
          <FormField label="Status">
            <select
              className={inputClassName}
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value as ProductStatus)}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </FormField>
        </form>
      </Modal>
    </section>
  );
}

export function ReferencesPage() {
  return <MasterDataPage config={configs.references} />;
}

export function ManufacturersPage() {
  return <MasterDataPage config={configs.manufacturers} />;
}

export function BrandsPage() {
  return <MasterDataPage config={configs.brands} />;
}

export function SuppliersPage() {
  return <MasterDataPage config={configs.suppliers} />;
}

export function CustomersPage() {
  return <MasterDataPage config={configs.customers} />;
}

export function EmployeesPage() {
  return <MasterDataPage config={configs.employees} />;
}
