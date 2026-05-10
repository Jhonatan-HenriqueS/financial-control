"use client";

import { Info, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dashboard/DeleteConfirmationDialog";
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

// Popover de ações de um gasto.
// Ele segue o mesmo padrão das categorias: botão Info abre as ações disponíveis.
export function ExpenseActionsPopover({
  expense,
  onDelete,
}: ExpenseActionsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Confirma a exclusão e usa a mesma função que a lista de gastos já usava.
  function handleConfirmDelete() {
    setIsOpen(false);
    onDelete(expense.id);
  }

  return (
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
  );
}
