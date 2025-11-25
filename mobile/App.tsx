import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from './screens/HomeScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 segundos
    },
  },
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'add'>('home');

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        {currentScreen === 'home' ? (
          <HomeScreen onNavigateToAdd={() => setCurrentScreen('add')} />
        ) : (
          <AddTransactionScreen onNavigateBack={() => setCurrentScreen('home')} />
        )}
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
