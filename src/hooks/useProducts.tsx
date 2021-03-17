import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { formatPrice } from "../util/format";

interface IProduct {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface IProductFormatted extends IProduct {
  priceFormatted: string;
}

interface ProductsProviderProps {
  children: ReactNode;
}

const ProductsContext = createContext<IProductFormatted[]>([])

export const ProductsProvider = ({ children }: ProductsProviderProps) => {
  const [products, setProducts] = useState<IProductFormatted[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const { data } = await api.get('products')
      const productsFormatted = data.map((product: IProduct) => {
        const productFormatted = {
          ...product,
          priceFormatted: formatPrice(product.price)
        }
        return productFormatted
      })
      setProducts(productsFormatted)
    }

    loadProducts();
  }, []);
  
  return (
    <ProductsContext.Provider value={products}>
      { children }
    </ProductsContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductsContext)

  return context
}
