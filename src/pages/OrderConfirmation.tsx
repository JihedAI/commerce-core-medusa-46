import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Package, Mail, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { sdk } from "@/lib/sdk";
import { useTranslation } from "react-i18next";

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  unit_price?: number;
  subtotal?: number;
  thumbnail?: string;
  product?: { thumbnail?: string };
  variant?: { title?: string };
}

interface OrderSummaryData {
  id: string;
  total: number;
  subtotal?: number;
  shipping_total?: number;
  tax_total?: number;
  currency_code: string;
  items: OrderItem[];
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState<OrderSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const res = await sdk.store.order.retrieve(id as string);
        setOrder(res.order as any);
      } catch (e) {
        setError(t('orders.loadFailed', { defaultValue: 'Failed to load order details' }));
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, t]);

  const formatPrice = (amount: number | undefined, currency?: string) => {
    if (amount === undefined) return '';
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || 'USD').toUpperCase(),
    }).format(amount / 1);
  };

  return (
    <Layout>
      <div id="order-print" className="container mx-auto px-4 py-16 print:py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Brand Logo (also prints) */}
          <div className="mb-6 flex justify-center items-center gap-3">
            <span className="font-display font-extrabold tracking-[0.35em] uppercase text-2xl text-primary print:text-black">
              Amine
            </span>
          </div>
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-display font-bold mb-4">{t('orderConfirmation.title', { defaultValue: 'Order Confirmed!' })}</h1>
          <p className="text-muted-foreground mb-2">
            {t('orderConfirmation.thankYou', { defaultValue: 'Thank you for your purchase. Your order has been successfully placed.' })}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {t('orderConfirmation.orderId', { defaultValue: 'Order ID' })}: <span className="font-mono font-semibold">{id}</span>
          </p>

          {/* Mini Order Summary */}
          {!loading && !error && order && (
            <Card className="p-6 text-left mb-8">
              <h2 className="font-semibold mb-4">{t('orderConfirmation.summaryTitle', { defaultValue: 'Order Summary' })}</h2>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const unit = (item.unit_price ?? (item.subtotal || 0) / Math.max(1, item.quantity));
                  const thumb = item.thumbnail || item.product?.thumbnail || "/placeholder.svg";
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {item.variant?.title && (
                          <p className="text-xs text-muted-foreground truncate">{item.variant.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('checkout.qty', { defaultValue: 'Qty' })}: {item.quantity} · {formatPrice(unit, order.currency_code)} {t('orders.each', { defaultValue: 'each' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatPrice(item.subtotal ?? (unit * item.quantity), order.currency_code)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                {order.subtotal !== undefined && (
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.subtotal', { defaultValue: 'Subtotal' })}</span><span>{formatPrice(order.subtotal, order.currency_code)}</span></div>
                )}
                {order.shipping_total !== undefined && (
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.shipping', { defaultValue: 'Shipping' })}</span><span>{formatPrice(order.shipping_total, order.currency_code)}</span></div>
                )}
                {order.tax_total !== undefined && (
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.tax', { defaultValue: 'Tax' })}</span><span>{formatPrice(order.tax_total, order.currency_code)}</span></div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base pt-1">
                  <span>{t('cart.total', { defaultValue: 'Total' })}</span><span>{formatPrice(order.total, order.currency_code)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Order Details Card */}
          <Card className="p-6 text-left mb-8">
            <h2 className="font-semibold mb-4">{t('orderConfirmation.whatsNext', { defaultValue: "What's Next?" })}</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">{t('orderConfirmation.emailTitle', { defaultValue: 'Order Confirmation Email' })}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('orderConfirmation.emailDesc', { defaultValue: "We've sent a confirmation email with your order details and tracking information." })}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-4">
                <Package className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">{t('orderConfirmation.processingTitle', { defaultValue: 'Order Processing' })}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('orderConfirmation.processingDesc', { defaultValue: 'Your order is being prepared and will be shipped within 1-2 business days.' })}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-4">
                <Truck className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">{t('orderConfirmation.deliveryTitle', { defaultValue: 'Delivery' })}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('orderConfirmation.deliveryDesc', { defaultValue: "You'll receive tracking information once your order ships. Estimated delivery: 5-7 business days." })}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.print()} variant="outline">
              {t('orderConfirmation.print', { defaultValue: 'Print' })}
            </Button>
            <Button onClick={() => navigate("/products")} variant="outline">
              {t('cart.continueShopping', { defaultValue: 'Continue Shopping' })}
            </Button>
            <Button onClick={() => navigate("/")} className="bg-gradient-primary">
              {t('nav.home', { defaultValue: 'Home' })}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}