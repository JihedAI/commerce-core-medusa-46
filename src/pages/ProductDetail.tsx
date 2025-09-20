// Inside your render
const priceObj = selectedVariant?.calculated_price
const displayAmount =
  priceObj?.calculated_amount_with_tax ??
  priceObj?.calculated_amount

// If no price (rare), fallback to cheapest variant
let finalAmount = displayAmount
if (!finalAmount && product?.variants?.length) {
  const cheapest = product.variants.slice().sort((a, b) => {
    const ax =
      a.calculated_price?.calculated_amount_with_tax ??
      a.calculated_price?.calculated_amount ??
      Infinity
    const bx =
      b.calculated_price?.calculated_amount_with_tax ??
      b.calculated_price?.calculated_amount ??
      Infinity
    return ax - bx
  })[0]
  finalAmount =
    cheapest?.calculated_price?.calculated_amount_with_tax ??
    cheapest?.calculated_price?.calculated_amount
}

<p className="text-xl font-bold">
  {finalAmount
    ? formatPrice(finalAmount, currency)
    : "Price unavailable"}
</p>
