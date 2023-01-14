import { FlatList, TouchableOpacity } from 'react-native';
import { CartItem } from '../../types/CartItem';
import { Actions, Image, Item, ProductContainer, ProductDetails, QuantityContainer, Sumary, TotalContainer } from './styles';
import { Text } from '../Text';
import { formatCurrency } from '../../utils/formatCurrency';
import { PlusCircle } from '../Icons/PlusCircle';
import { MinusCircle } from '../Icons/MinusCircle';
import { Button } from '../Button';
import { Product } from '../../types/Product';
import { OrderConfirmedModal } from '../OrderConfirmedModal';
import { useState } from 'react';
import { api } from '../../utils/api';

interface CartProps {
  cartItems: Array<CartItem>;
  selectedTable: string;
  onAdd: (product: Product) => void;
  onDecrement: (product: Product) => void;
  onConfirmOrder: () => void,
}

export function Cart({ cartItems, selectedTable, onAdd, onDecrement, onConfirmOrder }: CartProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const total = cartItems.reduce((acc, cartItem) => {
    return acc + cartItem.quantity * cartItem.product.price;
  }, 0);

  async function handleConfirmOrder() {
    setIsLoading(true);
    const payload = {
      table: selectedTable,
      products: cartItems.map((cartItem) => ({
        quantity: cartItem.quantity,
        product: cartItem.product._id,
      }))
    };

    await api.post('/orders', payload);
    setIsLoading(false);
    setIsModalVisible(true);
  }

  function handleOk() {
    onConfirmOrder();
    setIsModalVisible(false);
  }

  return  (
    <>
      <OrderConfirmedModal
        visible={isModalVisible}
        onOk={handleOk}
      />

      {cartItems.length > 0 && (
        <FlatList
          data={cartItems}
          keyExtractor={cartItem => cartItem.product._id}
          showsVerticalScrollIndicator={false}
          style={{marginBottom: 20, maxHeight: 150}}
          renderItem={({item: cartItem}) => (
            <Item>
              <ProductContainer>
                <Image
                  source={{
                    uri: `http://192.168.100.6:4000/uploads/${cartItem.product.imagePath}`,
                  }}
                />

                <QuantityContainer>
                  <Text size={14} color="#666">
                    {cartItem.quantity}x
                  </Text>
                </QuantityContainer>

                <ProductDetails>
                  <Text size={14} weight='600'>{cartItem.product.name}</Text>
                  <Text size={14} color="#666" style={{marginTop: 4}}>{formatCurrency(cartItem.product.price)}</Text>
                </ProductDetails>
              </ProductContainer>

              <Actions>
                <TouchableOpacity
                  style={{marginRight: 24}}
                  onPress={() => onAdd(cartItem.product)}
                >
                  <PlusCircle/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onDecrement(cartItem.product)}>
                  <MinusCircle/>
                </TouchableOpacity>
              </Actions>
            </Item>
          )}
        />
      )}

      <Sumary>
        <TotalContainer>
          {cartItems.length > 0 ? (
            <>
              <Text color="#666">Total</Text>
              <Text size={20} weight="600">{formatCurrency(total)}</Text>
            </>
          ) : (
            <Text color="##999">Seu carrinho está vazio</Text>
          )}
        </TotalContainer>

        <Button
          disabled={cartItems.length === 0}
          loading={isLoading}
          onPress={handleConfirmOrder}>
                Confirmar pedido
        </Button>
      </Sumary>
    </>
  );
}
