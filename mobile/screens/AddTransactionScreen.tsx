import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, accountsApi, transactionsApi } from '../lib/api';
import type { TransactionCreate } from '../lib/api';
import CategoryIcon from '../components/CategoryIcon';

interface AddTransactionScreenProps {
  onNavigateBack: () => void;
}

export default function AddTransactionScreen({ onNavigateBack }: AddTransactionScreenProps) {
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  const { data: categories } = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: categoriesApi.getActive,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts', 'active'],
    queryFn: accountsApi.getActive,
  });

  const createMutation = useMutation({
    mutationFn: (transaction: TransactionCreate) => transactionsApi.create(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      Alert.alert('Éxito', 'Transacción creada correctamente');
      onNavigateBack();
    },
    onError: (error) => {
      Alert.alert('Error', 'No se pudo crear la transacción');
      console.error(error);
    },
  });

  const handleSave = () => {
    if (!amount || !description || !selectedCategoryId || !selectedAccountId) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const transaction: TransactionCreate = {
      date,
      description,
      amount: parseFloat(amount),
      type: 'expense',
      category_id: selectedCategoryId,
      account_id: selectedAccountId,
      currency: 'PEN',
    };

    createMutation.mutate(transaction);
  };

  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];
  const activeAccounts = accounts || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Transacción</Text>
      </View>

      {/* Monto */}
      <View style={styles.section}>
        <Text style={styles.label}>💵 Monto (PEN)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Descripción */}
      <View style={styles.section}>
        <Text style={styles.label}>📝 Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Almuerzo en restaurante"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Categoría */}
      <View style={styles.section}>
        <Text style={styles.label}>🏷️ Categoría</Text>
        <View style={styles.optionsContainer}>
          {expenseCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.option,
                selectedCategoryId === cat.id && styles.optionSelected,
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <View style={styles.optionContent}>
                <CategoryIcon iconName={cat.icon} size={20} />
                <Text style={styles.optionText}>{cat.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Cuenta */}
      <View style={styles.section}>
        <Text style={styles.label}>💳 Cuenta</Text>
        <View style={styles.optionsContainer}>
          {activeAccounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={[
                styles.option,
                selectedAccountId === acc.id && styles.optionSelected,
              ]}
              onPress={() => setSelectedAccountId(acc.id)}
            >
              <View style={styles.optionContent}>
                <CategoryIcon iconName={acc.icon} size={20} />
                <Text style={styles.optionText}>{acc.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fecha */}
      <View style={styles.section}>
        <Text style={styles.label}>📅 Fecha</Text>
        <Text style={styles.dateValue}>{date}</Text>
        <Text style={styles.hint}>Por defecto: hoy</Text>
      </View>

      {/* Botón Guardar */}
      <TouchableOpacity
        style={[styles.saveButton, createMutation.isPending && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={createMutation.isPending}
      >
        <Text style={styles.saveButtonText}>
          {createMutation.isPending ? 'Guardando...' : '✅ Guardar'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    color: '#8B5CF6',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F0FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  dateValue: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
