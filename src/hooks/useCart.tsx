import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

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
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productInCart = cart.find(product => product.id === productId)

      if(productInCart) {
        const amountInCart = productInCart.amount
        const { data: stock } = await api.get(`stock/${productId}`)

        if(amountInCart >= stock.amount) {
          toast.error('Quantidade solicitada fora de estoque')
          return
        }

        const updatedProduct = { ...productInCart, amount: productInCart.amount + 1 }
        const updatedCart = cart.map(cartItem => cartItem.id === productId ? updatedProduct : cartItem)
        
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

        toast.success('Adicionado ao carrinho')
      } 

      else {
        const { data: product } = await api.get(`products/${productId}`)

        if(!product) {
          toast.error('Erro na adição do produto')
          return
        }

        const formattedProduct = { ...product, amount: 1 }

        setCart(oldCart => [...oldCart, formattedProduct])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, formattedProduct]))

        toast.success('Adicionado ao carrinho')
      }

    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.some(cartItem => cartItem.id === productId)

      if(!productExists) {
        toast.error('Erro na remoção do produto')
        return
      }

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
      if (amount <= 0) {
        toast.error('Erro na alteração de quantidade do produto')
        return 
      }

      const { data: stock } = await api.get<Stock>(`stock/${productId}`)

      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return 
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
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch(err) {
      toast.error('Erro na alteração de quantidade do produto')
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
