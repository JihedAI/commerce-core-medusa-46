import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Package, Mail, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-display font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Order ID: <span className="font-mono font-semibold">{id}</span>
          </p>

          {/* Order Details Card */}
          <Card className="p-6 text-left mb-8">
            <h2 className="font-semibold mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Order Confirmation Email</p>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation email with your order details and tracking information.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-4">
                <Package className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Your order is being prepared and will be shipped within 1-2 business days.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex gap-4">
                <Truck className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive tracking information once your order ships. Estimated delivery: 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/products")} variant="outline">
              Continue Shopping
            </Button>
            <Button onClick={() => navigate("/")} className="bg-gradient-primary">
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}