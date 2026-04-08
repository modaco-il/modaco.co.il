"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface CategoryFormProps {
  action: (formData: FormData) => Promise<{ success: boolean }>;
}

export function CategoryForm({ action }: CategoryFormProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 ml-1" />
        קטגוריה חדשה
      </Button>
    );
  }

  return (
    <Card className="bg-blue-50">
      <CardHeader>
        <CardTitle className="text-base">קטגוריה חדשה</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">שם</Label>
              <Input name="name" required placeholder="צירים" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Slug</Label>
              <Input name="slug" required placeholder="hinges" dir="ltr" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              צור
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              ביטול
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
