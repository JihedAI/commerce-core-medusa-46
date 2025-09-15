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
  items?: Array<{
    id: string;
    title: string;
    quantity: number;
    thumbnail?: string;
  }>;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { customer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!customer?.id) {
      setLoading(false);
      return;
    }

    const fetchCustomerOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch orders - the SDK should automatically filter by authenticated customer
        const response = await sdk.store.order.list({ 
          limit: 10,
          fields: "id,display_id,created_at,status,total,currency_code,items",
          order: "-created_at"
        });
        
        setOrders(response.orders || []);
      } catch (err: any) {
        console.error("Failed to fetch customer orders:", err);
        setError("Unable to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerOrders();
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

  if (!customer?.id) {
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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="font-medium">Order #{order.display_id || order.id.slice(-8)}</div>
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {formatDate(new Date(order.created_at), "MMM dd, yyyy 'at' HH:mm")}
              </div>
              {order.items && order.items.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  {order.items.length <= 3 && (
                    <span> - {order.items.map(item => item.title).join(', ')}</span>
                  )}
                </div>
              )}
            </div>
            <div className="text-right ml-4">
              <div className="font-semibold text-lg">
                {formatPrice(order.total, order.currency_code)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}