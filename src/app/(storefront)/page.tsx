import { HomepageHero } from "./_components/homepage-hero";
import { FeaturedCategories } from "./_components/featured-categories";
import { DealsOfTheDay } from "./_components/deals-of-the-day";
import { CategoryProductRows } from "./_components/category-product-rows";
import { ShopBySolution } from "./_components/shop-by-solution";
import { WhyChooseUs } from "./_components/why-choose-us";
import { BrandPartners } from "./_components/brand-partners";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-12 lg:gap-16 px-4 sm:px-8 py-8 sm:py-12">
      <HomepageHero />
      <FeaturedCategories />
      <DealsOfTheDay />
      <CategoryProductRows />
      <ShopBySolution />
      <WhyChooseUs />
      <BrandPartners />
    </div>
  );
}
