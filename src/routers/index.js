import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Pages
import SignInPage from "../pages/sign-in/index";
import HomePage from "../pages/home/index";
import OrdersPage from "../pages/orders/sales/index";
import OrderDetails from "../pages/orders/sales/orderDetails";
import AddProductToOrder from "../components/products/addProductToOrder";
import Checkout from "../components/checkout/index";

const Stack = createNativeStackNavigator();

export default function Routes() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SignInPage"
                component={SignInPage}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="HomePage"
                component={HomePage}
                options={{ headerShown: false, title: 'Menu' }}
            />
            <Stack.Screen
                name="SalesOrdersPage"
                component={OrdersPage}
                options={{ headerShown: true, title: 'Pedidos de Venda', headerBackButtonMenuEnabled: false }}
            />
            <Stack.Screen
                name="OrderDetails"
                component={OrderDetails}
                options={{ headerShown: true, title: 'Detalhes do pedido' }}
            />
            <Stack.Screen
                name="AddProductToOrder"
                component={AddProductToOrder}
                options={{ headerShown: true, title: 'Adicionar Produto ao Pedido' }}
            />
            <Stack.Screen
                name="Checkout"
                component={Checkout}
                options={{ headerShown: true, title: 'Forma de Pagamento' }}
            />

        </Stack.Navigator>
    );
}