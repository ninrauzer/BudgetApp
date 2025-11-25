import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    let onNavigateToAdd: () -> Void
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if viewModel.isLoading {
                    ProgressView("Cargando...")
                        .padding(.top, 50)
                } else if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .padding()
                } else {
                    // Balance Disponible
                    if let available = viewModel.available {
                        VStack(spacing: 8) {
                            Text("BALANCE DISPONIBLE")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .tracking(1)
                            
                            Text("S/ \(available.available_balance, specifier: "%.2f")")
                                .font(.system(size: 48, weight: .black, design: .rounded))
                                .foregroundColor(available.available_balance >= 0 ? .green : .red)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 32)
                        .background(Color.white)
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.1), radius: 8, y: 2)
                    }
                    
                    // Este Mes
                    if let available = viewModel.available {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("📊 Este Mes")
                                .font(.headline)
                            
                            HStack {
                                Text("Ingresos:")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text("S/ \(available.total_income, specifier: "%.2f")")
                                    .fontWeight(.semibold)
                                    .foregroundColor(.green)
                            }
                            
                            HStack {
                                Text("Gastos Fijos:")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text("S/ \(available.fixed_expenses, specifier: "%.2f")")
                                    .fontWeight(.semibold)
                                    .foregroundColor(.red)
                            }
                            
                            HStack {
                                Text("Gastos Variables:")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text("S/ \(available.variable_expenses, specifier: "%.2f")")
                                    .fontWeight(.semibold)
                                    .foregroundColor(.red)
                            }
                            
                            if available.pending_income > 0 {
                                Divider()
                                    .padding(.vertical, 4)
                                
                                HStack {
                                    Text("Pendiente por cobrar:")
                                        .foregroundColor(.secondary)
                                    Spacer()
                                    Text("S/ \(available.pending_income, specifier: "%.2f")")
                                        .fontWeight(.semibold)
                                        .foregroundColor(.orange)
                                }
                            }
                        }
                        .padding(20)
                        .background(Color.white)
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.1), radius: 8, y: 2)
                    }
                    
                    // Proyección
                    if let projection = viewModel.projection {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("🎯 Proyección del Mes")
                                .font(.headline)
                            
                            HStack {
                                Text("Balance actual:")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text("S/ \(projection.current_balance, specifier: "%.2f")")
                                    .fontWeight(.semibold)
                            }
                            
                            HStack {
                                Text("Balance proyectado:")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text("S/ \(projection.projected_balance, specifier: "%.2f")")
                                    .fontWeight(.semibold)
                                    .foregroundColor(projection.projected_balance >= 0 ? .green : .red)
                            }
                            
                            HStack {
                                Text("Días restantes:")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text("\(projection.days_remaining)")
                                    .fontWeight(.semibold)
                            }
                            
                            if !projection.message.isEmpty {
                                Text(projection.message)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .padding(12)
                                    .background(Color.gray.opacity(0.1))
                                    .cornerRadius(8)
                            }
                        }
                        .padding(20)
                        .background(Color.white)
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.1), radius: 8, y: 2)
                    }
                    
                    // Botón Agregar
                    Button(action: onNavigateToAdd) {
                        Text("➕ Agregar Gasto")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.purple)
                            .cornerRadius(12)
                    }
                    .padding(.top, 8)
                }
            }
            .padding(16)
        }
        .background(Color(UIColor.systemGroupedBackground))
        .navigationTitle("BudgetApp")
        .task {
            await viewModel.loadDashboard()
        }
    }
}

#Preview {
    NavigationView {
        DashboardView(onNavigateToAdd: {})
    }
}
