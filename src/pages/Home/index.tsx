import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useEffect, useState } from 'react';

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const products = useProducts()
  const { addProduct, cart } = useCart();

  const [cartItemsAmount, setCartItemsAmount] = useState({} as CartItemsAmount)

  useEffect(() => {
    setCartItemsAmount(cart.reduce((sumAmount, product) => {
      return {
        ...sumAmount,
        [product.id]: product.amount
      }
    }, {} as CartItemsAmount))
  }, [cart])

  function handleAddProduct(id: number) {
    addProduct(id)
  }

  return (
    <ProductList>
      {products.map(product => (
        <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>{product.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
