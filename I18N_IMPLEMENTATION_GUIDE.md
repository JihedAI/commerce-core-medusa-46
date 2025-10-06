# 🌍 Internationalization (i18n) Implementation Guide

## ✅ What's Been Set Up

### **1. Installed Dependencies**
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### **2. Created Translation Files**
- ✅ `public/locales/fr/translation.json` - French translations (PRIMARY)
- ✅ `public/locales/en/translation.json` - English translations

### **3. Configured i18n**
- ✅ `src/i18n.ts` - i18n configuration with French as default
- ✅ Integrated into `src/main.tsx`

### **4. Created Language Switcher**
- ✅ `src/components/LanguageSwitcher.tsx` - Globe icon dropdown with FR/EN

---

## 🚀 How to Use Translations in Components

### **Basic Usage**

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <Button>{t('buttons.addToCart')}</Button>
    </div>
  );
}
```

### **With Variables**

```tsx
// Translation file:
{
  "products": {
    "showing": "Affichage de {{count}} produits"
  }
}

// Component:
<p>{t('products.showing', { count: 12 })}</p>
// Output: "Affichage de 12 produits"
```

### **Change Language**

```tsx
import { useTranslation } from 'react-i18next';

function LanguageButton() {
  const { i18n } = useTranslation();
  
  return (
    <button onClick={() => i18n.changeLanguage('fr')}>
      Français
    </button>
  );
}
```

---

## 📝 Components to Update

### **Priority 1: Navigation & Core UI**

#### **1. Header/Navigation** (`src/components/Header.tsx`)
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Replace:
<Link to="/">Home</Link>
// With:
<Link to="/">{t('nav.home')}</Link>

// Replace:
<Link to="/products">Products</Link>
// With:
<Link to="/products">{t('nav.products')}</Link>
```

#### **2. UserMenu** (`src/components/user/UserMenu.tsx`)
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Replace:
<span>My Profile</span>
// With:
<span>{t('profile.myProfile')}</span>

// Replace:
<span>My Orders</span>
// With:
<span>{t('profile.myOrders')}</span>

// Replace:
<span>Log out</span>
// With:
<span>{t('nav.logout')}</span>
```

#### **3. Login** (`src/components/Login.tsx`)
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Replace:
<CardTitle>Login</CardTitle>
// With:
<CardTitle>{t('auth.login')}</CardTitle>

// Replace:
<Label htmlFor="email">Email</Label>
// With:
<Label htmlFor="email">{t('auth.email')}</Label>

// Replace:
<Button>{isLoading ? 'Signing In...' : 'Login'}</Button>
// With:
<Button>{isLoading ? t('auth.loggingIn') : t('auth.login')}</Button>

// Replace:
Continue with Google
// With:
{t('auth.googleLogin')}

// Replace toast messages:
toast({
  title: t('auth.loginSuccess'),
  description: t('auth.welcomeBack', { name: customer.first_name }),
});
```

#### **4. Product Card** (`src/components/ProductCardOptimized.tsx`)
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Replace:
<Badge variant="destructive">Out of Stock</Badge>
// With:
<Badge variant="destructive">{t('products.outOfStock')}</Badge>

// Replace:
<ShoppingBag className="h-3 w-3 mr-1" />
Add
// With:
<ShoppingBag className="h-3 w-3 mr-1" />
{t('buttons.add')}
```

### **Priority 2: Product Pages**

#### **5. Products Page** (`src/pages/Products.tsx`)
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Replace:
<h2>All Products</h2>
// With:
<h2>{t('products.allProducts')}</h2>

// Replace:
<option value="price-low">Price: Low to High</option>
// With:
<option value="price-low">{t('sort.priceLow')}</option>

// Replace:
"Showing {products.length} products"
// With:
{t('products.showing', { count: products.length })}

// Replace:
"Clear All Filters"
// With:
{t('filters.clearFilters')}
```

#### **6. Product Carousel** (`src/components/ProductCarousel.tsx`)
```tsx
// The tag name comes from your backend (already in French!)
// So no changes needed - it will display French product tag names
```

### **Priority 3: Cart & Checkout**

#### **7. Cart** (`src/components/CartDrawer.tsx`)
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Replace:
<h2>Cart</h2>
// With:
<h2>{t('cart.cart')}</h2>

// Replace:
<Button>Checkout</Button>
// With:
<Button>{t('buttons.checkout')}</Button>
```

#### **8. Checkout** (`src/pages/Checkout.tsx`)
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Replace:
<h1>Checkout</h1>
// With:
<h1>{t('checkout.checkout')}</h1>

// Replace:
<Label>Shipping Address</Label>
// With:
<Label>{t('checkout.shippingAddress')}</Label>
```

---

## 🎨 Add Language Switcher to Header

Update your Header component to include the language switcher:

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

// In your header JSX, add:
<div className="flex items-center gap-2">
  <LanguageSwitcher />
  <UserMenu />
  <CartIcon />
</div>
```

---

## 📋 Translation Keys Reference

### **Navigation**
- `nav.home` - Accueil
- `nav.products` - Produits
- `nav.cart` - Panier
- `nav.profile` - Profil
- `nav.login` - Connexion
- `nav.logout` - Déconnexion

### **Buttons**
- `buttons.addToCart` - Ajouter au Panier
- `buttons.checkout` - Commander
- `buttons.save` - Enregistrer
- `buttons.cancel` - Annuler

### **Products**
- `products.featured` - Produits Vedettes
- `products.allProducts` - Tous les Produits
- `products.outOfStock` - Rupture de stock
- `products.loading` - Chargement des produits...

### **Auth**
- `auth.login` - Connexion
- `auth.email` - E-mail
- `auth.password` - Mot de passe
- `auth.loginSuccess` - Connexion réussie!

### **Cart**
- `cart.cart` - Panier
- `cart.emptyCart` - Votre panier est vide
- `cart.total` - Total

### **Common**
- `common.loading` - Chargement...
- `common.error` - Erreur
- `common.success` - Succès

---

## 🧪 Testing

### **1. Check Current Language**
```tsx
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
console.log('Current language:', i18n.language); // 'fr' or 'en'
```

### **2. Change Language Programmatically**
```tsx
i18n.changeLanguage('fr'); // Switch to French
i18n.changeLanguage('en'); // Switch to English
```

### **3. Check if Translation Exists**
```tsx
const exists = i18n.exists('nav.home');
console.log('Translation exists:', exists);
```

---

## 📊 Progress Tracker

### ✅ Completed
- [x] Install i18next dependencies
- [x] Create French translations (primary)
- [x] Create English translations
- [x] Configure i18n
- [x] Create language switcher component
- [x] Add i18n to main.tsx

### 🔄 To Do (Next Steps)
- [ ] Update Header component
- [ ] Update UserMenu component
- [ ] Update Login component
- [ ] Update Register component
- [ ] Update Products page
- [ ] Update Product cards
- [ ] Update Cart drawer
- [ ] Update Checkout page
- [ ] Update Customer Profile
- [ ] Update Footer
- [ ] Add language switcher to header
- [ ] Test all pages in French
- [ ] Test language switching

---

## 🎯 Quick Start Commands

```tsx
// 1. Import useTranslation hook
import { useTranslation } from 'react-i18next';

// 2. Get translation function
const { t } = useTranslation();

// 3. Use it!
<h1>{t('nav.home')}</h1>
```

---

## 💡 Tips

1. **Products are already French in Medusa** - No need to translate product titles/descriptions!
2. **Start with high-visibility components** - Header, navigation, buttons
3. **Test frequently** - Switch languages to see changes
4. **Use consistent keys** - Follow the structure in translation.json
5. **Don't translate brand names** - Keep "Medusa", company names as-is

---

## 🆘 Need Help?

Check the translation files:
- `public/locales/fr/translation.json` - All French translations
- `public/locales/en/translation.json` - All English translations

All translation keys are organized by category (nav, buttons, products, etc.) for easy finding!

