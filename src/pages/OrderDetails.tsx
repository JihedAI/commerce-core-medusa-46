import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { sdk } from "@/lib/sdk";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, MapPin, CreditCard } from "lucide-react";
import { formatDate } from "date-fns";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total: number;
  thumbnail?: string;
  variant?: {
    title: string;
    options?: Array<{
      option: { value: string };
    }>;
  };
}

interface Address {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  province?: string;
  postal_code: string;
  country_code: string;
  phone?: string;
}

interface OrderDetails {
  id: string;
  display_id: number;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  total: number;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  currency_code: string;
  created_at: string | Date;
  items: OrderItem[];
  shipping_address?: Address;
  billing_address?: Address;
  email: string;
}

export default function OrderDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) {
      navigate('/login');
      return;
    }

    if (!id) {
      navigate('/profile');
      return;
    }

    fetchOrderDetails(id);
  }, [id, customer, navigate]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { order } = await sdk.store.order.retrieve(orderId);
      
      // Security: Verify customer owns this order (defense in depth)
      if (order.customer_id !== customer?.id) {
        setError(t('orders.accessDenied', { defaultValue: 'You do not have permission to view this order' }));
        toast({
          title: t('toast.accessDenied', { defaultValue: 'Access Denied' }),
          description: t('toast.noPermission', { defaultValue: 'You do not have permission to view this order' }),
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }
      
      setOrder(order as any); // Using any to avoid complex type conversion
    } catch (err: any) {
      // Handle unauthorized access
      if (err?.status === 403 || err?.status === 401) {
        setError(t('orders.accessDenied', { defaultValue: 'You do not have permission to view this order' }));
        toast({
          title: t('toast.accessDenied', { defaultValue: 'Access Denied' }),
          description: t('toast.noPermission', { defaultValue: 'You do not have permission to view this order' }),
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }
      
      if (import.meta.env.DEV) {
        console.error("Failed to fetch order details:", { status: err?.status, message: err?.message });
      }
      setError(t('orders.loadFailed', { defaultValue: 'Failed to load order details' }));
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "shipped":
        return "default";
      case "pending":
      case "processing":
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
    }).format(amount / 1);
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.first_name && address.last_name ? `${address.first_name} ${address.last_name}` : '',
      address.company || '',
      address.address_1,
      address.address_2 || '',
      `${address.city}, ${address.province || ''} ${address.postal_code}`,
      address.country_code.toUpperCase(),
    ].filter(Boolean);
    
    return parts.join('\n');
  };

  if (!customer) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{t('orders.orderDetails', { defaultValue: 'Order Details' })}</h1>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error || t('orders.notFound', { defaultValue: 'Order not found' })}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/profile')}>
                {t('profile.myProfile', { defaultValue: 'Back to Profile' })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t('orders.orderNumber', { number: order.display_id, defaultValue: `Order #${order.display_id}` })}</h1>
              <p className="text-muted-foreground">
                {t('orders.placedOn', { defaultValue: 'Placed on' })} {formatDate(new Date(order.created_at), "MMMM dd, yyyy 'at' HH:mm")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatPrice(order.total, order.currency_code)}
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant={getStatusVariant(order.status)}>
                {order.status}
              </Badge>
              <Badge variant={getStatusVariant(order.payment_status)}>
                {order.payment_status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t('orders.items', { defaultValue: 'Order Items' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.variant?.title && (
                        <p className="text-sm text-muted-foreground">{item.variant.title}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm">{t('checkout.qty', { defaultValue: 'Qty' })}: {item.quantity}</span>
                        <span className="text-sm">
                          {formatPrice(item.unit_price, order.currency_code)} {t('orders.each', { defaultValue: 'each' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice(item.total, order.currency_code)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {t('orders.shippingAddress', { defaultValue: 'Shipping Address' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-sm">
                    {formatAddress(order.shipping_address)}
                  </div>
                  {order.shipping_address.phone && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('forms.phone', { defaultValue: 'Phone' })}: {order.shipping_address.phone}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('checkout.orderSummary', { defaultValue: 'Order Summary' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal', { defaultValue: 'Subtotal' })}</span>
                  <span>{formatPrice(order.subtotal, order.currency_code)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.shipping', { defaultValue: 'Shipping' })}</span>
                  <span>{formatPrice(order.shipping_total, order.currency_code)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.tax', { defaultValue: 'Tax' })}</span>
                  <span>{formatPrice(order.tax_total, order.currency_code)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('cart.total', { defaultValue: 'Total' })}</span>
                  <span>{formatPrice(order.total, order.currency_code)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            {order.billing_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('orders.billingAddress', { defaultValue: 'Billing Address' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-sm">
                    {formatAddress(order.billing_address)}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{t('orders.needHelp', { defaultValue: 'Need Help?' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('orders.questions', { defaultValue: 'Questions about your order?' })}
                </p>
                <Button variant="outline" className="w-full">
                  {t('orders.contactSupport', { defaultValue: 'Contact Support' })}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}