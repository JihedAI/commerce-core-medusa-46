import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import useCategories from "@/hooks/useCategories";
import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";

export default function Categories() {
  const { data = { flat: [], tree: [] }, isLoading } = useCategories({ limit: 100, fields: "id,name,handle,description,parent_category_id" });
  const categories = data.flat || [];

  return (
    <Layout>
      <SEO
        title="Product Categories - Browse Designer Eyewear"
        description="Browse our eyewear by category: sunglasses, optical frames, contact lenses & accessories. Find your perfect style from top brands."
        url="https://lunette.amine.agency/categories"
        type="website"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Product Categories</h1>
          <p className="text-muted-foreground">
            Browse our products by category to find exactly what you're looking for
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category) => (
              <Link key={category.id} to={`/categories/${category.id}`}>
                <Card className="group p-6 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center text-primary">
                      <span className="text-sm font-medium">View Products</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}