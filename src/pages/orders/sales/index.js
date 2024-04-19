import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Modal, SafeAreaView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../../utils/axiosInstance';
import Cielo from '../../../services/Cielo';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders', {
          params: {
            page: 1,
            itemsPerPage: 50,
            provider: '/people/8',
            'status[0]': 6
          }
        });

        setOrders(response.data['hydra:member'].map(order => ({
          ...order,
          orderDate: new Date(order.orderDate).toLocaleDateString('pt-BR'),
          status: translateStatus(order.status.status),
          totalPrice: formatPrice(order.price)
        })));
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');

        console.log(response.data);

        setProducts(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    if (editModalVisible) {
      fetchProducts();
    }
  }, [editModalVisible]);

  const translateStatus = (status) => {
    const statusMap = {
      'waiting payment': 'Aguardando pagamento',
    };

    return statusMap[status] || status;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handlePay = async (orderId) => {
    setResponse('Aguarde...');
    const service = new Cielo();

    try {
      const data = await service.payment();
      setResponse(JSON.stringify(data, null, 2));
      await createInvoice(data, orderId);
      setErrorModalVisible(true);
    } catch (error) {
      console.error('Erro ao processar o pagamento:', error);
      setResponse('Erro ao processar o pagamento');
      setErrorModalVisible(true);
    }
  };

  const createInvoice = async (data, orderId) => {
    const payload = {
      dueDate: "2024-03-21",
      payer: "/people/7",
      status: "/statuses/37",
      wallet: "/wallets/3",
      paymentType: "/payment_types/4",
      price: 80,
      receiver: "/people/8",
      order: `orders/${orderId}`
    };

    try {
      const response = await api.post('/invoices', payload);
      console.log("Invoice created:", response.data);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleEdit = async (orderId) => {
    setEditModalVisible(true);
  };

  const addProductToOrder = (product) => {
    setSelectedProducts([...selectedProducts, product]);
  };
  

  const renderProductItem = ({ item }) => (
    <TouchableOpacity onPress={() => addProductToOrder(item)}>
      <Text>{item.product}</Text>
    </TouchableOpacity>
  );
  
    

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3FB8AF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          {orders.map(order => (
            <View key={order.id} style={styles.boxWrap}>
              <View style={styles.boxHeader}>
                <Text style={[styles.boxTextColor, styles.boxOrderText]}>Pedido: #{order.id}</Text>
                <Text style={[styles.boxTextColor, styles.boxPrice]}>{order.totalPrice}</Text>
              </View>
              <View style={styles.boxClient}>
                <Text style={styles.boxClientText}>CLIENTE: {order.client ? order.client.name : ''}</Text>
              </View>
              <View style={styles.boxContent}>
                <Text style={[styles.boxDateText, styles.boxTextColor]}>{order.orderDate}</Text>
                <Text style={styles.boxStatusText}>{order.status}</Text>
              </View>
              <View style={styles.boxPay}>
                <TouchableOpacity style={[styles.boxButton]} onPress={() => handleEdit(order.id)}>
                  <Icon name="edit" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Visible Modal Error */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => {
          setErrorModalVisible(false);
        }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000000' }}>Erro</Text>
            <Text style={{ color: '#000000' }}>{response}</Text>
            <TouchableOpacity onPress={() => setErrorModalVisible(false)} style={{ marginTop: 20 }}>
              <Icon name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Visible Modal Edit Order */}
      <Modal
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false)
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000000' }}>Adicionar Produtos ao Pedido</Text>
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={item => item.id}
            />
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ marginTop: 20 }}>
              <Icon name="cancel" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1B5587',
  },
  boxWrap: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 7,
    marginBottom: 15,
    borderRightColor: '#5bbf4b',
    borderRightWidth: 7,
  },
  boxHeader: {
    backgroundColor: '#f4f4f4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopEndRadius: 7,
    borderTopLeftRadius: 7,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  boxContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopEndRadius: 7,
    borderTopLeftRadius: 7,
  },
  boxOrderText: {
    fontWeight: '700',
  },
  boxClient: {
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  boxClientText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '500'
  },

  boxTextColor: {
    color: '#000000',
  },
  boxDateText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '500',
  },
  boxPrice: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700'
  },
  boxStatusText: {
    padding: 7,
    borderRadius: 20,
    fontSize: 13,
    color: '#000000',
    fontWeight: '500',
  },
  boxPay: {
    flex: 1,
  },
  boxButton: {
    backgroundColor: '#3FB8AF',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 7,
    borderBottomEndRadius: 7,
    marginRight: -7,

  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700'
  },

});

export default Orders;