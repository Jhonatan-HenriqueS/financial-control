"use client";

import { Info, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/dashboard/DeleteConfirmationDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { ExpenseCategory } from "@/types/category";

interface CategoryActionsPopoverProps {
  category: ExpenseCategory;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: (categoryId: string) => void;
}

// Popover de ações de uma categoria.
// Ele substitui os botões soltos por um botão de informações que abre editar/excluir.
export function CategoryActionsPopover({
  category,
  onEdit,
  onDelete,
}: CategoryActionsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fecha o popover e chama a edição usando a mesma função que já existia.
  function handleEdit() {
    setIsOpen(false);
    onEdit(category);
  }

  // Confirma a exclusão e usa a mesma função que já existia.
  function handleConfirmDelete() {
    setIsOpen(false);
    onDelete(category.id);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          aria-label={`Abrir ações da categoria ${category.name}`}
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
          onClick={handleEdit}
          variant="whiteAction"
          size="actionRow"
        >
          <Pencil size={15} strokeWidth={2.1} />
          Editar
        </Button>

        <DeleteConfirmationDialog
          itemType="Categoria"
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
