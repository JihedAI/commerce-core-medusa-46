import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { sdk } from "@/lib/medusa"
import Layout from "@/components/Layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

export default function ProductDetail() {
  const { handle } = useParams() as { handle: string }

  const [product, setProduct] = useState<any>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [exploreProducts, setExploreProducts] = useState<any[]>([])
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch regions for pricing context
        const { regions } = await sdk.store.region.list()
        const region = regions?.[0]
        if (!region) return

        setCurrency(region.currency_code.toUpperCase())

        // 2. Fetch main product
        const { products } = await sdk.store.product.list({
          handle,
          fields:
            "id,title,description,weight,length,width,height,material,+variants.calculated_price,+variants.options,+images,+collection",
          region_id: region.id,
          country_code: region.countries?.[0]?.iso_2,
          limit: 1,
        })

        const prod = products?.[0]
        if (!prod) return

        setProduct(prod)
        if (prod.variants?.[0]) setSelectedVariant(prod.variants[0])

        // 3. Fetch related products
        if (prod.collection?.id) {
          const { products: related } = await sdk.store.product.list({
            collection_id: [prod.collection.id],
            fields: "+variants.calculated_price,+images,+collection",
            region_id: region.id,
            country_code: region.countries?.[0]?.iso_2,
            limit: 6,
          })
          setRelatedProducts(related)
        }

        // 4. Fetch explore products
        const { products: explore } = await sdk.store.product.list({
          fields: "+variants.calculated_price,+images,+collection",
          region_id: region.id,
          country_code: region.countries?.[0]?.iso_2,
          limit: 12,
        })
        setExploreProducts(explore)
      } catch (err) {
        console.error("Error fetching product:", err)
      }
    }

    fetchData()
  }, [handle])

  if (!product) return <p>Loading...</p>

  // ✅ Price handling with fallback
  const priceObj = selectedVariant?.calculated_price
  let displayAmount =
    priceObj?.calculated_amount_with_tax ??
    priceObj?.calculated_amount

  if (!displayAmount && product?.variants?.length) {
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
    displayAmount =
      cheapest?.calculated_price?.calculated_amount_with_tax ??
      cheapest?.calculated_price?.calculated_amount
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <img
              src={product?.images?.[0]?.url || "/placeholder.svg"}
              alt={product.title}
              className="w-full rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg"
              }}
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

            {/* ✅ Dynamic Price */}
            <p className="text-xl font-bold mb-6">
              {displayAmount
                ? formatPrice(displayAmount, currency)
                : "Price unavailable"}
            </p>

            {/* Variants (optional) */}
            {product.variants?.length > 1 && (
              <div className="mb-6">
                <label className="block mb-2 font-medium">Choose Variant:</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={selectedVariant?.id}
                  onChange={(e) => {
                    const variant = product.variants.find(
                      (v: any) => v.id === e.target.value
                    )
                    setSelectedVariant(variant)
                  }}
                >
                  {product.variants.map((variant: any) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button className="w-full mb-8">Add to Cart</Button>

            {/* Accordions */}
            <Accordion type="single" collapsible>
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    {product.description || "No description available"}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="details">
                <AccordionTrigger>Details</AccordionTrigger>
                <AccordionContent>
                  {/* ✅ Dynamic attributes */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {`Weight: ${product.weight ?? "N/A"}g | Dimensions: ${product.length ?? "N/A"}x${product.width ?? "N/A"}x${product.height ?? "N/A"}cm | Material: ${product.material ?? "N/A"}`}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/products/${rp.handle}`}>
                  <div className="border rounded-lg p-4 hover:shadow-lg">
                    <img
                      src={rp.images?.[0]?.url || "/placeholder.svg"}
                      alt={rp.title}
                      className="w-full h-40 object-cover rounded mb-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                    <h3 className="text-sm font-medium">{rp.title}</h3>
                    {rp.variants?.[0]?.calculated_price && (
                      <p className="text-muted-foreground text-sm">
                        {formatPrice(
                          rp.variants[0].calculated_price.calculated_amount_with_tax ??
                            rp.variants[0].calculated_price.calculated_amount ??
                            0,
                          currency
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Explore More */}
        {exploreProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Explore More</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {exploreProducts.map((ep) => (
                <Link key={ep.id} href={`/products/${ep.handle}`}>
                  <div className="border rounded-lg p-4 hover:shadow-lg">
                    <img
                      src={ep.images?.[0]?.url || "/placeholder.svg"}
                      alt={ep.title}
                      className="w-full h-40 object-cover rounded mb-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                    <h3 className="text-sm font-medium">{ep.title}</h3>
                    {ep.variants?.[0]?.calculated_price && (
                      <p className="text-muted-foreground text-sm">
                        {formatPrice(
                          ep.variants[0].calculated_price.calculated_amount_with_tax ??
                            ep.variants[0].calculated_price.calculated_amount ??
                            0,
                          currency
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}