"use client";

import { Plus } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { CategoryActionsPopover } from "@/components/dashboard/CategoryActionsPopover";
import { CategoryModal } from "@/components/dashboard/CategoryModal";
import { Button } from "@/components/ui/button";
import {
  createCategory,
  deleteCategory,
  getCategories,
  subscribeToCategories,
  updateCategory,
} from "@/lib/categories";
import type { ExpenseCategory } from "@/types/category";

// Lista vazia fixa para o snapshot do servidor.
// Ela precisa ser a mesma referencia para o React nao interpretar como mudanca infinita.
const EMPTY_CATEGORIES: ExpenseCategory[] = [];

// Retorna uma lista vazia durante a renderizacao no servidor.
// O navegador preenche a lista real lendo o localStorage.
const getServerCategoriesSnapshot = () => EMPTY_CATEGORIES;

// Tempo usado pela animacao do modal.
// O componente so desmonta depois desse tempo para a saida aparecer.
const CATEGORY_MODAL_ANIMATION_MS = 180;

// Tela de categorias renderizada dentro do DashboardShell.
// Aqui o usuario cria, visualiza, edita e exclui categorias de gastos.
export function CategoriesContent() {
  const categories = useSyncExternalStore(
    subscribeToCategories,
    getCategories,
    getServerCategoriesSnapshot,
  );
  const closeTimerRef = useRef<number | null>(null);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategory | null>(null);
  const [message, setMessage] = useState("");

  // Abre o modal limpo para criar uma categoria nova.
  function openCreateModal() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    setEditingCategory(null);
    setMessage("");
    setIsModalMounted(true);
    setIsModalOpen(true);
  }

  // Abre o modal preenchido para editar uma categoria existente.
  function openEditModal(category: ExpenseCategory) {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    setEditingCategory(category);
    setMessage("");
    setIsModalMounted(true);
    setIsModalOpen(true);
  }

  // Fecha o modal e limpa o estado temporario do formulario.
  // A limpeza acontece depois da animacao para evitar que o conteudo pisque durante a saida.
  function closeModal() {
    setIsModalOpen(false);

    closeTimerRef.current = window.setTimeout(() => {
      setIsModalMounted(false);
      setEditingCategory(null);
      setMessage("");
    }, CATEGORY_MODAL_ANIMATION_MS);
  }

  // Salva uma categoria nova ou atualiza a categoria em edicao.
  function handleCategorySubmit(categoryName: string) {
    const result = editingCategory
      ? updateCategory(editingCategory.id, categoryName)
      : createCategory(categoryName);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    closeModal();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Card de introducao da pagina, com sombra para destacar o titulo e a acao principal. */}
      <div className="rounded-[30px] bg-white p-5 shadow-[0_18px_54px_rgba(255,136,0,0.12),0_22px_65px_rgba(45,35,24,0.08)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Categorize seu gastos
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Use as categorias para saber exatamente em qual setor seus gastos
              são.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreateModal}
            variant="sun"
            size="cta"
          >
            Criar categoria
            <Plus size={18} strokeWidth={2.2} />
          </Button>
        </div>
      </div>

      <section className="rounded-[28px] bg-white p-4 shadow-[0_16px_50px_rgba(255,136,0,0.1),0_18px_55px_rgba(45,35,24,0.07)] sm:p-5">
        {categories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50/45 p-3 shadow-[0_10px_26px_rgba(255,136,0,0.1),0_10px_24px_rgba(15,23,42,0.05)]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* A cor unica da categoria aparece como circulo ao lado do nome. */}
                  <span
                    className="h-7 w-7 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55),0_4px_10px_rgba(15,23,42,0.12)]"
                    style={{ backgroundColor: category.color }}
                    aria-hidden="true"
                  />
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-950">
                    {category.name}
                  </p>
                </div>

                <CategoryActionsPopover
                  category={category}
                  onEdit={openEditModal}
                  onDelete={deleteCategory}
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-3xl bg-orange-50/70 px-4 text-center">
            <p className="text-sm font-bold text-slate-950">
              Nenhuma categoria criada ainda.
            </p>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
              Crie sua primeira categoria para organizar seus gastos.
            </p>
          </div>
        )}
      </section>

      {isModalMounted ? (
        <CategoryModal
          category={editingCategory}
          errorMessage={message}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleCategorySubmit}
        />
      ) : null}
    </div>
  );
}
