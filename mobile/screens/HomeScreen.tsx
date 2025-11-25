import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeScreenProps {
  onNavigateToAdd: () => void;
}

export default function HomeScreen({ onNavigateToAdd }: HomeScreenProps) {
  const { data: available, isLoading: loadingAvailable } = useQuery({
    queryKey: ['dashboard', 'available'],
    queryFn: dashboardApi.getAvailable,
  });

  const { data: projection, isLoading: loadingProjection } = useQuery({
    queryKey: ['dashboard', 'projection'],
    queryFn: dashboardApi.getProjection,
  });

  if (loadingAvailable || loadingProjection) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Text style={styles.loadingText}>💰</Text>
          <Text style={styles.loadingSubtext}>Cargando tus finanzas...</Text>
        </View>
      </View>
    );
  }

  const healthColor = available?.health_status === 'healthy' ? ['#10B981', '#059669'] : 
                     available?.health_status === 'warning' ? ['#F59E0B', '#D97706'] : 
                     ['#EF4444', '#DC2626'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Header */}
      <LinearGradient
        colors={['#8B5CF6', '#6D28D9']}
        style={styles.header}
      >
        <Text style={styles.greeting}>Hola 👋</Text>
        <Text style={styles.headerTitle}>Tu Balance Hoy</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Balance Disponible - Hero Card */}
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={healthColor}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroCardContent}>
              <Text style={styles.heroLabel}>💰 Disponible</Text>
              <Text style={styles.heroAmount}>
                S/ {available?.available_amount?.toFixed(2) || '0.00'}
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Límite diario</Text>
                  <Text style={styles.heroStatValue}>S/ {available?.daily_limit?.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatLabel}>Días restantes</Text>
                  <Text style={styles.heroStatValue}>{available?.days_remaining || 0}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statLabel}>Ingresos</Text>
            <Text style={styles.statValuePositive}>
              S/ {available?.monthly_income?.toFixed(0) || '0'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statLabel}>Gastos Fijos</Text>
            <Text style={styles.statValueNegative}>
              S/ {available?.fixed_expenses_budgeted?.toFixed(0) || '0'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💸</Text>
            <Text style={styles.statLabel}>Variables</Text>
            <Text style={styles.statValueNegative}>
              S/ {available?.variable_expenses_spent?.toFixed(0) || '0'}
            </Text>
          </View>
        </View>

        {/* Proyección Card */}
        <View style={styles.projectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎯</Text>
            <Text style={styles.cardTitle}>Proyección del Mes</Text>
          </View>
          
          <View style={styles.projectionContent}>
            <View style={styles.projectionMain}>
              <Text style={styles.projectionLabel}>Terminarás con</Text>
              <Text style={[
                styles.projectionAmount, 
                { color: projection?.is_positive ? '#10B981' : '#EF4444' }
              ]}>
                {projection?.is_positive ? '+' : ''}S/ {projection?.projected_balance?.toFixed(2) || '0.00'}
              </Text>
            </View>

            <View style={styles.projectionStats}>
              <View style={styles.projectionStat}>
                <Text style={styles.projectionStatLabel}>Gasto diario</Text>
                <Text style={styles.projectionStatValue}>
                  S/ {projection?.daily_average_spending?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <View style={styles.projectionStat}>
                <Text style={styles.projectionStatLabel}>Días que faltan</Text>
                <Text style={styles.projectionStatValue}>
                  {projection?.days_remaining || 0}
                </Text>
              </View>
            </View>

            {projection?.message && (
              <View style={styles.messageBox}>
                <Text style={styles.messageIcon}>💡</Text>
                <Text style={styles.messageText}>{projection.message}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Botón fijo en el scroll */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={onNavigateToAdd}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.addButtonText}>+ Agregar Gasto</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroCardContainer: {
    marginTop: -24,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  heroCardContent: {
    padding: 28,
  },
  heroLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 24,
    letterSpacing: -2,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  statValuePositive: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  statValueNegative: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
  },
  projectionCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  projectionContent: {
    gap: 16,
  },
  projectionMain: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  projectionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  projectionAmount: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  projectionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  projectionStat: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  projectionStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '600',
  },
  projectionStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  messageBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    gap: 12,
  },
  messageIcon: {
    fontSize: 20,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    fontWeight: '500',
  },
  addButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
