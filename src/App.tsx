import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { RegionProvider } from "@/contexts/RegionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Collections from "./pages/Collections";
import CollectionProducts from "./pages/CollectionProducts";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderDetails from "./pages/OrderDetails";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Register from "./components/Register";
import CustomerProfile from "./pages/CustomerProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RegionProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<CustomerProfile />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:handle" element={<ProductDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:id" element={<Products />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:id" element={<CollectionProducts />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </RegionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;