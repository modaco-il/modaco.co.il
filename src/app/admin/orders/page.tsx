import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockOrders = [
  {
    id: "1",
    orderNumber: "MOD-0005",
    customer: "יוסי כהן",
    phone: "050-1234567",
    total: 1250,
    items: 3,
    status: "PAID" as const,
    createdAt: "08/04/2026 14:30",
  },
  {
    id: "2",
    orderNumber: "MOD-0004",
    customer: "שרית לוי",
    phone: "052-9876543",
    total: 3800,
    items: 7,
    status: "PROCESSING" as const,
    createdAt: "08/04/2026 10:15",
  },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PAID: "שולמה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  DELIVERED: "הגיעה",
  CANCELLED: "בוטלה",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">הזמנות</h1>

      <Tabs defaultValue="all">
        <TabsList className="w-full lg:w-auto">
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="pending">ממתינות</TabsTrigger>
          <TabsTrigger value="processing">בטיפול</TabsTrigger>
          <TabsTrigger value="shipped">נשלחו</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {mockOrders.map((order) => (
            <Card key={order.id} className="hover:bg-gray-50 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{order.orderNumber}</div>
                    <div className="text-sm text-gray-600">
                      {order.customer}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.createdAt} · {order.items} פריטים
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                    <div className="font-bold mt-1">
                      ₪{order.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
