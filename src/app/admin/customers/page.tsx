export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const groupLabels: Record<string, string> = {
  retail: "קמעונאי",
  architect: "אדריכל",
  contractor: "קבלן",
  vip: "VIP",
};

const groupColors: Record<string, string> = {
  retail: "bg-gray-100 text-gray-700",
  architect: "bg-purple-100 text-purple-700",
  contractor: "bg-blue-100 text-blue-700",
  vip: "bg-yellow-100 text-yellow-700",
};

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    include: {
      user: true,
      group: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">לקוחות</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="חיפוש לפי שם, טלפון או אימייל..." className="pr-10" />
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {customer.user.name || "ללא שם"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {customer.user.phone} · {customer.user.email}
                  </div>
                  {customer.company && (
                    <div className="text-sm text-gray-400">
                      {customer.company}
                      {customer.taxId && ` (ח.פ ${customer.taxId})`}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {customer.group && (
                    <Badge className={groupColors[customer.group.name] || ""}>
                      {groupLabels[customer.group.name] || customer.group.displayName}
                    </Badge>
                  )}
                  <div className="text-left text-sm">
                    <div className="font-medium">
                      {customer._count.orders} הזמנות
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            עדיין אין לקוחות רשומים
          </div>
        )}
      </div>
    </div>
  );
}
