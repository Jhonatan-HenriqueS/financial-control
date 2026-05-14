"use client";

import { Info, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dashboard/DeleteConfirmationDialog";
import { EditExpenseModal } from "@/components/dashboard/EditExpenseModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/types/expense";

interface ExpenseActionsPopoverProps {
  expense: Expense;
  onDelete: (expenseId: string) => void;
}

const EDIT_MODAL_ANIMATION_MS = 180;

// Popover de ações de um gasto.
// Ele segue o mesmo padrão das categorias: botão Info abre as ações disponíveis.
export function ExpenseActionsPopover({
  expense,
  onDelete,
}: ExpenseActionsPopoverProps) {
  const editCloseTimerRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalMounted, setIsEditModalMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Abre o modal de edição do gasto selecionado.
  function openEditModal() {
    if (editCloseTimerRef.current) {
      window.clearTimeout(editCloseTimerRef.current);
    }

    setIsOpen(false);
    setIsEditModalMounted(true);
    setIsEditModalOpen(true);
  }

  // Fecha o modal depois da animação de saída.
  function closeEditModal() {
    setIsEditModalOpen(false);

    editCloseTimerRef.current = window.setTimeout(() => {
      setIsEditModalMounted(false);
    }, EDIT_MODAL_ANIMATION_MS);
  }

  // Confirma a exclusão e usa a mesma função que a lista de gastos já usava.
  function handleConfirmDelete() {
    setIsOpen(false);
    onDelete(expense.id);
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            aria-label={`Abrir ações do gasto ${expense.name}`}
            variant="glassIcon"
            size="panelIcon"
          >
            <Info size={17} strokeWidth={2.1} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={10}
          className="w-40 rounded-2xl bg-white/88 p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16),0_14px_34px_rgba(255,136,0,0.1)] ring-0 backdrop-blur-xl"
        >
          <Button
            type="button"
            variant="whiteAction"
            size="actionRow"
            onClick={openEditModal}
          >
            <Pencil size={15} strokeWidth={2.1} />
            Editar
          </Button>

          <DeleteConfirmationDialog
            itemType="gasto"
            onConfirm={handleConfirmDelete}
            trigger={
              <Button type="button" variant="dangerAction" size="actionRow">
                <Trash2 size={15} strokeWidth={2.1} />
                Excluir
              </Button>
            }
          />
        </PopoverContent>
      </Popover>

      {isEditModalMounted ? (
        <EditExpenseModal
          expense={expense}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
        />
      ) : null}
    </>
  );
}
