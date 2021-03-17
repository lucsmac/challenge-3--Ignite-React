import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { Product, Stock } from '../types';
import { useProducts } from './useProducts';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const products = useProducts()
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productExists = products.find(productItem => productItem.id === productId)

      if (!productExists) {
        return 
      }

      const product = products.find(productItem => productItem.id === productExists.id)
      const productAmount = cart.filter(cartItem => cartItem.id === productId)
      
      if (!product) {
        return 
      }

      const formattedProduct = {
        ...product,
        amount: productAmount.length
      }

      setCart([...cart, formattedProduct])
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
