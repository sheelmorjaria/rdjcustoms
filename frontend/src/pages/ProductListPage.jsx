import { useEffect, useState } from 'react';
import useProducts from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import SortOptions from '../components/SortOptions';
import FilterSidebar from '../components/FilterSidebar';

const ProductListPage = () => {
  const { products, pagination, loading, error, fetchProducts } = useProducts();
  const [currentSort, setCurrentSort] = useState('newest');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: { min: '', max: '' }
  });

  // Categories - now only Action Figure Accessories remains
  const categories = [
    { id: 'cat1', name: 'Action Figure Accessories', slug: 'action-figure-accessories' }
  ];

  useEffect(() => {
    const params = {
      sort: currentSort,
      ...(filters.category && { category: filters.category }),
      ...(filters.priceRange.min && { minPrice: filters.priceRange.min }),
      ...(filters.priceRange.max && { maxPrice: filters.priceRange.max })
    };
    fetchProducts(params);
  }, [fetchProducts, currentSort, filters]);

  const handleRetry = () => {
    const params = {
      sort: currentSort,
      ...(filters.category && { category: filters.category }),
      ...(filters.priceRange.min && { minPrice: filters.priceRange.min }),
      ...(filters.priceRange.max && { maxPrice: filters.priceRange.max })
    };
    fetchProducts(params);
  };

  const handlePageChange = (newPage) => {
    const params = {
      page: newPage,
      sort: currentSort,
      ...(filters.category && { category: filters.category }),
      ...(filters.condition && { condition: filters.condition }),
      ...(filters.priceRange.min && { minPrice: filters.priceRange.min }),
      ...(filters.priceRange.max && { maxPrice: filters.priceRange.max })
    };
    fetchProducts(params);
  };

  const handleSortChange = (newSort) => {
    setCurrentSort(newSort);
    const params = {
      sort: newSort,
      page: 1,
      ...(filters.category && { category: filters.category }),
      ...(filters.condition && { condition: filters.condition }),
      ...(filters.priceRange.min && { minPrice: filters.priceRange.min }),
      ...(filters.priceRange.max && { maxPrice: filters.priceRange.max })
    };
    fetchProducts(params);
  };

  const handleCategoryChange = (category) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handlePriceRangeChange = (priceRange) => {
    setFilters(prev => ({ ...prev, priceRange }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      priceRange: { min: '', max: '' }
    });
  };

  // Loading state
  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-64">
          <div 
            data-testid="loading-spinner" 
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          ></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Error loading products</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">RDJCustoms Products</h1>
          <p className="text-lg text-muted-foreground mb-8">Custom products and services</p>
          
          <div className="flex flex-col items-center justify-center min-h-64">
            <h2 className="text-2xl font-bold text-foreground mb-2">No products found</h2>
            <p className="text-muted-foreground">We couldn't find any products matching your criteria.</p>
          </div>
        </div>
      </main>
    );
  }

  const productCountText = pagination.total === 1 ? '1 product found' : `${pagination.total} products found`;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4 animate-wave">RDJCustoms Products</h1>
        <p className="text-lg text-muted-foreground mb-4">Custom products and services</p>
        <p className="text-sm text-muted-foreground">{productCountText}</p>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <div className="lg:w-1/4">
          <FilterSidebar
            categories={categories}
            selectedCategory={filters.category}
            priceRange={filters.priceRange}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Products Content */}
        <div className="lg:w-3/4">
          {/* Sorting Controls */}
          <div className="flex justify-end mb-6">
            <SortOptions currentSort={currentSort} onSortChange={handleSortChange} />
          </div>

          {/* Products Grid */}
          <section aria-label="Product listings">
            <div className="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </main>
  );
};

export default ProductListPage;