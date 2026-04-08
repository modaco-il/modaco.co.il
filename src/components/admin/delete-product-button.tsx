"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({
  productId,
  onDelete,
}: {
  productId: string;
  onDelete: () => Promise<void>;
}) {
  return (
    <form
      action={async () => {
        if (!confirm("למחוק את המוצר? פעולה זו לא ניתנת לביטול.")) return;
        await onDelete();
      }}
    >
      <Button type="submit" variant="ghost" size="sm" className="text-red-600">
        <Trash2 className="w-4 h-4 ml-1" />
        מחק
      </Button>
    </form>
  );
}
