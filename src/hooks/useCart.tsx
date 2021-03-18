import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
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
  const [stock, setStock] = useState<Stock[]>([])

  useEffect(() => {
    const loadStock = async () => {
      api.get('stock')
        .then(({ data }) => setStock(data))
    }

    loadStock()
  }, [])

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

      if (!product) {
        throw new Error('Erro na adição do produt')
      }

      const productOnCart = cart.find(cartItem => cartItem.id === product.id)

      const amount = productOnCart ? productOnCart.amount + 1 : 1

      if (amount > stock[productId].amount) {
        throw new Error('Quantidade solicitada fora de estoque')
      }
      
      const formattedProduct = {
        ...product,
        amount
      }

      if (productOnCart) {
        const formattedCart = cart.map(cartItem => cartItem.id === product.id ? formattedProduct : cartItem)
        setCart(formattedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(formattedCart))
      } else {
        setCart(old => [...old, formattedProduct])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, formattedProduct]))
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = cart.filter(product => product.id !== productId)

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount > stock[productId].amount) {
        throw new Error('Quantidade solicitada fora de estoque')
      }

      const updatedCart = cart.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            amount
          }
        }

        return product
      })

      setCart(updatedCart)
    } catch(err) {
      toast.error(err.message)
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
