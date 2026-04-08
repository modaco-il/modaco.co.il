import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// TODO: Replace with real data from DB
const mockStats = {
  todayOrders: 5,
  todayRevenue: 3420,
  weekOrders: 23,
  weekRevenue: 18750,
  abandonedCarts: 3,
  lowStockItems: 7,
  totalProducts: 0,
  totalCustomers: 0,
};

const recentOrders = [
  {
    id: "1",
    orderNumber: "MOD-0001",
    customer: "דוגמה",
    total: 850,
    status: "PAID" as const,
    time: "לפני 2 שעות",
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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">דשבורד</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>הזמנות היום</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.todayOrders}</div>
            <p className="text-sm text-gray-500">
              ₪{mockStats.todayRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>הזמנות השבוע</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.weekOrders}</div>
            <p className="text-sm text-gray-500">
              ₪{mockStats.weekRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>עגלות נטושות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {mockStats.abandonedCarts}
            </div>
            <p className="text-sm text-gray-500">ממתינות לשחזור</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>מלאי נמוך</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {mockStats.lowStockItems}
            </div>
            <p className="text-sm text-gray-500">מוצרים לחידוש</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>הזמנות אחרונות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div>
                  <div className="font-medium">{order.orderNumber}</div>
                  <div className="text-sm text-gray-500">
                    {order.customer} · {order.time}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                  <span className="font-bold">
                    ₪{order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
