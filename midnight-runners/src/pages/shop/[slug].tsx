import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useWixClient } from "../../hooks/useWixClient";
import { products } from "@wix/stores";
import Image from "next/image";
import CartModal from "../../components/CartModal";
import CustomizeProducts from "../../components/CustomizeProducts";
import Reviews from "../../components/Reviews";
import Add from "../../components/Add";
import Header from "~/components/header";
import Footer from "~/components/footer";
import Loading from "../../components/Loading";

interface Media {
  mainMedia?: {
    image?: {
      url: string;
    };
  };
}

interface Product extends products.GetProductResponse {
  name: string;
  media: Media;
  description: string;
  price?: {
    price: number;
    discountedPrice?: number;
  };
  variants?: any[]; // Variants if any
  productOptions?: any[]; // Product options
  additionalInfoSections?: {
    title: string;
    description: string;
  }[];
}

const ProductPage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query; // Get slug from URL
  const { wixClient, clientReady } = useWixClient(); // Wix client context
  const [product, setProduct] = useState<Product | null>(null); // Product state
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [isCartModalOpen, setCartModalOpen] = useState(false); // Cart modal state

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug || !clientReady || !wixClient) return; // Ensure slug and client are ready

      setLoading(true); // Set loading state
      setError(null); // Clear previous errors
      try {
        const productsResponse = await wixClient.products
          .queryProducts()
          .eq("slug", slug as string)
          .find(); // Fetch product by slug
        if (!productsResponse.items.length) {
          setError("Product not found."); // If no product is found
          return;
        }
        const productData = productsResponse.items[0];
        setProduct(productData); // Set found product
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to fetch product. Please try again later."); // Error message
      } finally {
        setLoading(false); // Finish loading state
      }
    };
    
    fetchProduct(); // Call function
  }, [slug, wixClient, clientReady]); // Update when slug, wixClient, or clientReady changes

  // Loading or error messages
  if (loading) return <Loading />;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!product) return <p className="text-center text-lg">Product not found.</p>;

  const toggleCartModal = () => {
    setCartModalOpen((prev) => !prev); // Toggle cart modal state
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow container mx-auto px-4 md:px-8 pt-20 lg:flex lg:flex-row lg:items-start">
        {/* Image section */}
        <div className="w-full lg:w-1/2 lg:sticky top-20">
          <Image
            src={product.media?.mainMedia?.image?.url || "/product.png"}
            alt={product.name || "Product Image"}
            width={600}
            height={600}
            className="rounded-lg shadow-lg max-h-90 object-cover"
          />
        </div>
        {/* Details section */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 bg-gray-50 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p
            className="text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
          <div className="flex items-center mb-4">
            {product.price?.price === product.price?.discountedPrice ? (
              <span className="text-2xl font-semibold">
                €{product.price?.price}
              </span>
            ) : (
              <div className="flex items-center">
                <span className="text-lg text-gray-500 line-through mr-2">
                  €{product.price?.price}
                </span>
                <span className="text-2xl font-semibold text-red-600">
                  €{product.price?.discountedPrice}
                </span>
              </div>
            )}
          </div>
          {product.variants && product.productOptions ? (
            <CustomizeProducts
              productId={product._id!}
              variants={product.variants}
              productOptions={product.productOptions}
            />
          ) : (
            <Add
              productId={product._id!}
              variantId="00000000-0000-0000-0000-000000000000"
              stockNumber={product.stock?.quantity || 0}
            />
          )}
          <div className="my-6 border-t border-gray-300" />
          {product.additionalInfoSections?.map((section) => (
            <div className="mb-4" key={section.title}>
              <h4 className="font-medium text-lg mb-2">{section.title}</h4>
              <p className="text-gray-600">{section.description}</p>
            </div>
          ))}
          <div className="my-6 border-t border-gray-300" />
          <h1 className="text-2xl font-semibold mt-4">User Reviews</h1>
          <Reviews productId={product._id!} />
        </div>
        {isCartModalOpen && <CartModal onClose={toggleCartModal} />}
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage; // Export ProductPage component
