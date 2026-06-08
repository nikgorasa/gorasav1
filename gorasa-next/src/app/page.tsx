import { createClient } from "@/lib/supabase-server";
import HomePageClient from "@/components/HomePageClient";

export const revalidate = 300; // ISR: cache for 5 minutes

interface PackageItem {
  id: string;
  title: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating: number;
  imageUrl: string;
  provider: string;
  inclusions: string[];
  category: string;
}

interface CategoryMeta {
  title: string;
  subtitle: string;
  icon: string;
  badgeColor: string;
  badgeText: string;
}

function groupByCategory(packages: Record<string, unknown>[]): Record<string, PackageItem[]> {
  const grouped: Record<string, PackageItem[]> = {};
  for (const p of packages) {
    let images: string[] = [];
    try {
      images = typeof p.images === "string" ? JSON.parse(p.images as string) : (p.images as string[]) || [];
    } catch {
      images = [];
    }
    let inclusions: string[] = [];
    try {
      inclusions = typeof p.inclusions === "string" ? JSON.parse(p.inclusions as string) : (p.inclusions as string[]) || [];
    } catch {
      inclusions = [];
    }
    const item: PackageItem = {
      id: p.id as string,
      title: p.title as string,
      duration: p.duration as string,
      price: p.price as number,
      originalPrice: p.originalPrice as number | undefined,
      rating: p.rating as number,
      imageUrl: (images[0] as string) || "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
      provider: (p.provider as string) || "GoRASA Direct",
      inclusions,
      category: (p.category as string) || "STANDARD",
    };
    const cat = item.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }
  return grouped;
}

function mapCategories(rows: Record<string, unknown>[]): {
  map: Record<string, CategoryMeta>;
  order: string[];
} {
  const map: Record<string, CategoryMeta> = {};
  const order: string[] = [];
  for (const row of rows) {
    const id = row.id as string;
    map[id] = {
      title: row.title as string,
      subtitle: row.subtitle as string,
      icon: row.icon as string,
      badgeColor: (row.badgeColor as string) || (row.badgecolor as string) || "",
      badgeText: (row.badgeText as string) || (row.badgetext as string) || "",
    };
    order.push(id);
  }
  return { map, order };
}

export default async function HomePage() {
  const supabase = await createClient();
  try {
    const [packagesResult, testimonialsResult, categoriesResult, valuePropsResult, dashboardResult] =
      await Promise.all([
        supabase
          .from("Package")
          .select("id, title, duration, price, originalPrice, rating, provider, inclusions, images, category")
          .eq("isActive", true)
          .order("createdAt", { ascending: false }),
        supabase
          .from("Testimonial")
          .select("id, name, role, text, rating")
          .eq("isActive", true)
          .order("createdAt", { ascending: false }),
        supabase
          .from("PackageCategory")
          .select("*")
          .eq("isactive", true)
          .order("sortorder", { ascending: true }),
        supabase
          .from("ValueProposition")
          .select("id, icon, title, description")
          .eq("isactive", true)
          .order("sortorder", { ascending: true }),
        supabase
          .from("User")
          .select("companyId", { count: "exact", head: true })
          .not("companyId", "is", null),
      ]);

    const carouselPackages = groupByCategory(packagesResult.data || []);
    const testimonials = (testimonialsResult.data || []).map((t: Record<string, unknown>) => ({
      id: t.id as string,
      name: t.name as string,
      role: t.role as string,
      text: t.text as string,
      rating: t.rating as number,
    }));
    const { map: categoriesMap, order: categoryOrder } = mapCategories(categoriesResult.data || []);
    const valueProps = (valuePropsResult.data || []).map((v: Record<string, unknown>) => ({
      icon: v.icon as string,
      title: v.title as string,
      description: v.description as string,
    }));

    const uniqueCompanies = new Set(
      (dashboardResult.data || [])
        .map((u: Record<string, unknown>) => u.companyId as string)
        .filter(Boolean)
    );
    const stats = {
      companies: `${uniqueCompanies.size || 500}+`,
      bookings: `${(packagesResult.data || []).length * 2000}+`,
      rating: "4.9",
    };

    return (
      <HomePageClient
        carouselPackages={carouselPackages}
        testimonials={testimonials}
        categories={categoriesMap}
        categoryOrder={categoryOrder}
        valueProps={valueProps}
        stats={stats}
      />
    );
  } catch (error) {
    console.error("Homepage data fetch failed:", error);
    return (
      <HomePageClient
        carouselPackages={{}}
        testimonials={[]}
        categories={{}}
        categoryOrder={[]}
        valueProps={[]}
        stats={{ companies: "500+", bookings: "50K+", rating: "4.9" }}
        error="Unable to load data. Please try again."
      />
    );
  }
}
