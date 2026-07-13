import { FlatList, StyleSheet, Text, View } from 'react-native';

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  minimumStock: number;
};

const products: Product[] = [
  {
    id: 1,
    name: 'Coca-Cola 500 ml',
    price: 1800,
    stock: 12,
    minimumStock: 5,
  },
  {
    id: 2,
    name: 'Leche entera',
    price: 1500,
    stock: 3,
    minimumStock: 5,
  },
  {
    id: 3,
    name: 'Azúcar 1 kg',
    price: 1300,
    stock: 8,
    minimumStock: 4,
  },
];

export default function ProductsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Productos</Text>

      <FlatList
        data={products}
        keyExtractor={(product) => product.id.toString()}
        renderItem={({ item }) => {
          const hasLowStock = item.stock <= item.minimumStock;

          return (
            <View style={styles.productCard}>
              <View style={styles.productInformation}>
                <Text style={styles.productName}>{item.name}</Text>

                <Text style={styles.productPrice}>
                  ${item.price.toLocaleString('es-AR')}
                </Text>

                <Text>Stock: {item.stock}</Text>
              </View>

              {hasLowStock && (
                <Text style={styles.lowStockText}>Stock bajo</Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d4d4d4',
    borderRadius: 12,
  },
  productInformation: {
    gap: 4,
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 16,
  },
  lowStockText: {
    fontWeight: 'bold',
  },
});