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
      const product = products.find(productItem => productItem.id === productId)

      if (!product) return 

      const productOnCart = cart.find(cartItem => cartItem.id === product.id)

      const amount = productOnCart ? productOnCart.amount + 1 : 1

      const formattedProduct = {
        ...product,
        amount
      }

      if (productOnCart) {
        const formattedCart = cart.map(cartItem => cartItem.id === product.id ? formattedProduct : cartItem)
        setCart(formattedCart)
      } else {
        setCart(old => [...old, formattedProduct])
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    // try {
    //   const updatedCart = cart.filter(product => product.id !== productId)

    //   setCart(updatedCart)
    // } catch {
    //   toast.error('Erro na remoção do produto');
    // }
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
