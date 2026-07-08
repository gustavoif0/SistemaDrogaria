import {
  ClipboardCheck,
  Layers3,
  ListTree,
  Pencil,
  Pill,
  Plus,
  Save,
  Search,
  Tags,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { ActionButton } from "../../components/ui/ActionButton";
import { BadgeStatus } from "../../components/ui/BadgeStatus";
import { DataTable } from "../../components/ui/DataTable";
import { FormField, inputClassName, textareaClassName } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Tabs } from "../../components/ui/Tabs";
import { usePharma } from "../../store/PharmaContext";
import type { ProductCategory, ProductStatus, ProductSubcategory } from "../../types/domain";

interface CategoryFormState {
  name: string;
  description: string;
  status: ProductStatus;
}

interface SubcategoryFormState {
  categoryId: string;
  name: string;
  description: string;
  status: ProductStatus;
  requiresPharmacistReview: boolean;
}

const emptyCategoryForm: CategoryFormState = {
  name: "",
  description: "",
  status: "active",
};

function statusLabel(status: ProductStatus) {
  return status === "active" ? "Ativo" : "Inativo";
}

export function CategoriesPage() {
  const {
    categories,
    subcategories,
    products,
    addCategory,
    updateCategory,
    addSubcategory,
    updateSubcategory,
  } = usePharma();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("categorias");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<ProductSubcategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryFormState>({
    categoryId: categories[0]?.id ?? "",
    name: "",
    description: "",
    status: "active",
    requiresPharmacistReview: false,
  });

  const filteredCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return categories;

    return categories.filter((category) =>
      [category.name, category.description].join(" ").toLowerCase().includes(term),
    );
  }, [categories, query]);

  const filteredSubcategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return subcategories;

    return subcategories.filter((subcategory) => {
      const category = getCategoryById(subcategory.categoryId);
      return [subcategory.name, subcategory.description, category?.name]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [categories, query, subcategories]);

  function getCategoryById(categoryId: string) {
    return categories.find((category) => category.id === categoryId);
  }

  function getSubcategoryCount(categoryId: string) {
    return subcategories.filter((subcategory) => subcategory.categoryId === categoryId).length;
  }

  function getCategoryProductCount(categoryName: string) {
    return products.filter((product) => product.category === categoryName).length;
  }

  function getSubcategoryProductCount(subcategoryName: string) {
    return products.filter((product) => product.subcategory === subcategoryName).length;
  }

  function openNewCategory() {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    setCategoryModalOpen(true);
  }

  function openEditCategory(category: ProductCategory) {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      status: category.status,
    });
    setCategoryModalOpen(true);
  }

  function openNewSubcategory() {
    setEditingSubcategory(null);
    setSubcategoryForm({
      categoryId: categories[0]?.id ?? "",
      name: "",
      description: "",
      status: "active",
      requiresPharmacistReview: false,
    });
    setSubcategoryModalOpen(true);
  }

  function openEditSubcategory(subcategory: ProductSubcategory) {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      categoryId: subcategory.categoryId,
      name: subcategory.name,
      description: subcategory.description,
      status: subcategory.status,
      requiresPharmacistReview: subcategory.requiresPharmacistReview,
    });
    setSubcategoryModalOpen(true);
  }

  function closeCategoryModal() {
    setCategoryModalOpen(false);
    setEditingCategory(null);
  }

  function closeSubcategoryModal() {
    setSubcategoryModalOpen(false);
    setEditingSubcategory(null);
  }

  function handleCategorySubmit(event: FormEvent) {
    event.preventDefault();

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      status: categoryForm.status,
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, payload);
    } else {
      addCategory(payload);
    }

    closeCategoryModal();
  }

  function handleSubcategorySubmit(event: FormEvent) {
    event.preventDefault();

    const payload = {
      categoryId: subcategoryForm.categoryId,
      name: subcategoryForm.name.trim(),
      description: subcategoryForm.description.trim(),
      status: subcategoryForm.status,
      requiresPharmacistReview: subcategoryForm.requiresPharmacistReview,
    };

    if (editingSubcategory) {
      updateSubcategory(editingSubcategory.id, payload);
    } else {
      addSubcategory(payload);
    }

    closeSubcategoryModal();
  }

  return (
    <section>
      <PageHeader
        eyebrow="Cadastros"
        title="Categorias e Subcategorias"
        description="Classificacao comercial e operacional para organizar produtos de drogaria."
        actions={
          <>
            <ActionButton icon={Plus} onClick={openNewCategory} variant="primary">
              Nova categoria
            </ActionButton>
            <ActionButton icon={ListTree} onClick={openNewSubcategory} variant="info">
              Nova subcategoria
            </ActionButton>
          </>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Categorias"
            value={categories.length}
            detail="Grupos amplos de produto"
            icon={Tags}
          />
          <StatCard
            label="Subcategorias"
            value={subcategories.length}
            detail="Classificacao especifica"
            icon={ListTree}
            tone="blue"
          />
          <StatCard
            label="Produtos classificados"
            value={products.filter((product) => product.category && product.subcategory).length}
            detail="Usando categoria e subcategoria"
            icon={Pill}
            tone="green"
          />
          <StatCard
            label="Revisao farmaceutica"
            value={subcategories.filter((subcategory) => subcategory.requiresPharmacistReview).length}
            detail="Antibioticos e SNGPC no mock"
            icon={ClipboardCheck}
            tone="amber"
          />
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                className={`${inputClassName} pl-9`}
                placeholder="Pesquisar por categoria, subcategoria ou descricao"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Layers3 className="h-4 w-4 text-pharma-600" aria-hidden="true" />
              {filteredCategories.length} categorias | {filteredSubcategories.length} subcategorias
            </div>
          </div>
        </div>

        <Tabs
          activeId={activeTab}
          onChange={setActiveTab}
          items={[
            {
              id: "categorias",
              label: "Categorias",
              content: (
                <DataTable
                  data={filteredCategories}
                  getRowKey={(category) => category.id}
                  columns={[
                    {
                      header: "Categoria",
                      render: (category) => (
                        <div>
                          <p className="font-semibold text-slate-900">{category.name}</p>
                          <p className="text-xs text-slate-500">{category.description}</p>
                        </div>
                      ),
                    },
                    {
                      header: "Subcategorias",
                      align: "right",
                      render: (category) => getSubcategoryCount(category.id),
                    },
                    {
                      header: "Produtos",
                      align: "right",
                      render: (category) => getCategoryProductCount(category.name),
                    },
                    {
                      header: "Status",
                      render: (category) => (
                        <BadgeStatus tone={category.status === "active" ? "success" : "neutral"}>
                          {statusLabel(category.status)}
                        </BadgeStatus>
                      ),
                    },
                    {
                      header: "Acao",
                      align: "center",
                      render: (category) => (
                        <ActionButton
                          compact
                          data-testid={`category-edit-${category.id}`}
                          icon={Pencil}
                          onClick={() => openEditCategory(category)}
                          variant="ghost"
                        >
                          Editar
                        </ActionButton>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              id: "subcategorias",
              label: "Subcategorias",
              content: (
                <DataTable
                  data={filteredSubcategories}
                  getRowKey={(subcategory) => subcategory.id}
                  columns={[
                    {
                      header: "Subcategoria",
                      render: (subcategory) => (
                        <div>
                          <p className="font-semibold text-slate-900">{subcategory.name}</p>
                          <p className="text-xs text-slate-500">{subcategory.description}</p>
                        </div>
                      ),
                    },
                    {
                      header: "Categoria",
                      render: (subcategory) => getCategoryById(subcategory.categoryId)?.name ?? "Sem categoria",
                    },
                    {
                      header: "Revisao",
                      render: (subcategory) =>
                        subcategory.requiresPharmacistReview ? (
                          <BadgeStatus tone="warning">Farmaceutica</BadgeStatus>
                        ) : (
                          <BadgeStatus tone="neutral">Nao exige</BadgeStatus>
                        ),
                    },
                    {
                      header: "Produtos",
                      align: "right",
                      render: (subcategory) => getSubcategoryProductCount(subcategory.name),
                    },
                    {
                      header: "Status",
                      render: (subcategory) => (
                        <BadgeStatus tone={subcategory.status === "active" ? "success" : "neutral"}>
                          {statusLabel(subcategory.status)}
                        </BadgeStatus>
                      ),
                    },
                    {
                      header: "Acao",
                      align: "center",
                      render: (subcategory) => (
                        <ActionButton
                          compact
                          data-testid={`subcategory-edit-${subcategory.id}`}
                          icon={Pencil}
                          onClick={() => openEditSubcategory(subcategory)}
                          variant="ghost"
                        >
                          Editar
                        </ActionButton>
                      ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={editingCategory ? "Editar categoria" : "Nova categoria"}
        description="Categoria e o agrupamento amplo usado no cadastro de produtos."
        open={categoryModalOpen}
        onClose={closeCategoryModal}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={closeCategoryModal}>Cancelar</ActionButton>
            <ActionButton form="category-form" icon={Save} type="submit" variant="primary">
              Salvar categoria
            </ActionButton>
          </div>
        }
      >
        <form id="category-form" className="grid gap-4" onSubmit={handleCategorySubmit}>
          <FormField label="Nome">
            <input
              required
              className={inputClassName}
              value={categoryForm.name}
              onChange={(event) =>
                setCategoryForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Descricao">
            <textarea
              className={textareaClassName}
              value={categoryForm.description}
              onChange={(event) =>
                setCategoryForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Status">
            <select
              className={inputClassName}
              value={categoryForm.status}
              onChange={(event) =>
                setCategoryForm((current) => ({
                  ...current,
                  status: event.target.value as ProductStatus,
                }))
              }
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </FormField>
        </form>
      </Modal>

      <Modal
        title={editingSubcategory ? "Editar subcategoria" : "Nova subcategoria"}
        description="Subcategoria detalha a aplicacao operacional dentro da categoria."
        open={subcategoryModalOpen}
        onClose={closeSubcategoryModal}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={closeSubcategoryModal}>Cancelar</ActionButton>
            <ActionButton form="subcategory-form" icon={Save} type="submit" variant="primary">
              Salvar subcategoria
            </ActionButton>
          </div>
        }
      >
        <form id="subcategory-form" className="grid gap-4" onSubmit={handleSubcategorySubmit}>
          <FormField label="Categoria">
            <select
              required
              className={inputClassName}
              value={subcategoryForm.categoryId}
              onChange={(event) =>
                setSubcategoryForm((current) => ({ ...current, categoryId: event.target.value }))
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Nome">
            <input
              required
              className={inputClassName}
              value={subcategoryForm.name}
              onChange={(event) =>
                setSubcategoryForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Descricao">
            <textarea
              className={textareaClassName}
              value={subcategoryForm.description}
              onChange={(event) =>
                setSubcategoryForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Status">
              <select
                className={inputClassName}
                value={subcategoryForm.status}
                onChange={(event) =>
                  setSubcategoryForm((current) => ({
                    ...current,
                    status: event.target.value as ProductStatus,
                  }))
                }
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </FormField>
            <label className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={subcategoryForm.requiresPharmacistReview}
                onChange={(event) =>
                  setSubcategoryForm((current) => ({
                    ...current,
                    requiresPharmacistReview: event.target.checked,
                  }))
                }
              />
              Exige revisao farmaceutica
            </label>
          </div>
        </form>
      </Modal>
    </section>
  );
}
