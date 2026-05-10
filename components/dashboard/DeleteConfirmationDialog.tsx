"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  itemType: "gasto" | "Categoria";
  trigger: ReactNode;
  onConfirm: () => void;
}

// Dialog de confirmação reutilizado antes de excluir gastos ou categorias.
// Ele impede exclusões acidentais e mantém a mesma aparência em todo o dashboard.
export function DeleteConfirmationDialog({
  itemType,
  trigger,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  // Define o artigo correto para cada tipo de item.
  // "gasto" usa masculino; "Categoria" usa feminino.
  const title =
    itemType === "gasto"
      ? "Desejá excluir este gasto"
      : "Desejá excluir esta Categoria";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação removerá o item salvo no navegador e não poderá ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="whiteAction" className="h-11 px-5">
              Cancelar
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="dangerAction"
              className="h-11 px-5"
              onClick={onConfirm}
            >
              Excluir
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
