import { useEffect, useState } from "react";
import { sdk } from "@/lib/sdk";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "date-fns";

interface Order {
  id: string;
  display_id?: number;
  status: string;
  total: number;
  currency_code: string;
  created_at: string | Date;
  items?: any[];
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { customer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!customer) {
      setLoading(false);
      return;
    }

    sdk.store.order.list({ limit: 5, fields: "id,display_id,created_at,status,total,currency_code" })
      .then(({ orders }) => {
        setOrders(orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders");
        setLoading(false);
      });
  }, [customer]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (!customer) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to view your recent orders.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!orders.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No recent orders found.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.href = "/products"}>
            Start Shopping
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            <div>
              <div className="font-medium">Order #{order.display_id}</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(new Date(order.created_at), "MMM dd, yyyy 'at' HH:mm")}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {formatPrice(order.total, order.currency_code)}
              </div>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}