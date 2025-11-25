import SwiftUI

struct AddTransactionView: View {
    @StateObject private var viewModel = TransactionViewModel()
    @Binding var isPresented: Bool
    
    @State private var amount: String = ""
    @State private var description: String = ""
    @State private var selectedCategoryId: Int?
    @State private var selectedAccountId: Int?
    @State private var showAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header
                HStack {
                    Button("← Volver") {
                        isPresented = false
                    }
                    .foregroundColor(.purple)
                    
                    Spacer()
                }
                
                Text("Agregar Transacción")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                // Monto
                VStack(alignment: .leading, spacing: 8) {
                    Text("💵 Monto (PEN)")
                        .font(.headline)
                    
                    TextField("0.00", text: $amount)
                        .keyboardType(.decimalPad)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 2)
                        )
                }
                
                // Descripción
                VStack(alignment: .leading, spacing: 8) {
                    Text("📝 Descripción")
                        .font(.headline)
                    
                    TextField("Ej: Almuerzo en restaurante", text: $description)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 2)
                        )
                }
                
                // Categoría
                if viewModel.isLoading {
                    ProgressView("Cargando categorías...")
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("🏷️ Categoría")
                            .font(.headline)
                        
                        ForEach(viewModel.categories) { category in
                            Button(action: {
                                selectedCategoryId = category.id
                            }) {
                                HStack {
                                    Text("\(category.icon ?? "📦") \(category.name)")
                                        .foregroundColor(.primary)
                                    Spacer()
                                    if selectedCategoryId == category.id {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.purple)
                                    }
                                }
                                .padding()
                                .background(selectedCategoryId == category.id ? Color.purple.opacity(0.1) : Color.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(selectedCategoryId == category.id ? Color.purple : Color.gray.opacity(0.3), lineWidth: 2)
                                )
                            }
                        }
                    }
                }
                
                // Cuenta
                if !viewModel.accounts.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("💳 Cuenta")
                            .font(.headline)
                        
                        ForEach(viewModel.accounts) { account in
                            Button(action: {
                                selectedAccountId = account.id
                            }) {
                                HStack {
                                    Text("\(account.icon ?? "💰") \(account.name)")
                                        .foregroundColor(.primary)
                                    Spacer()
                                    if selectedAccountId == account.id {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.purple)
                                    }
                                }
                                .padding()
                                .background(selectedAccountId == account.id ? Color.purple.opacity(0.1) : Color.white)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(selectedAccountId == account.id ? Color.purple : Color.gray.opacity(0.3), lineWidth: 2)
                                )
                            }
                        }
                    }
                }
                
                // Botón Guardar
                Button(action: {
                    Task {
                        await saveTransaction()
                    }
                }) {
                    if viewModel.isSaving {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity)
                            .padding()
                    } else {
                        Text("✅ Guardar")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
                .background(viewModel.isSaving ? Color.gray : Color.green)
                .cornerRadius(12)
                .disabled(viewModel.isSaving)
                
                Spacer(minLength: 50)
            }
            .padding(16)
        }
        .background(Color(UIColor.systemGroupedBackground))
        .navigationBarHidden(true)
        .task {
            await viewModel.loadFormData()
        }
        .alert(isPresented: $showAlert) {
            Alert(title: Text("BudgetApp"), message: Text(alertMessage), dismissButton: .default(Text("OK")) {
                if viewModel.successMessage != nil {
                    isPresented = false
                }
            })
        }
    }
    
    private func saveTransaction() async {
        // Validaciones
        guard let amountValue = Double(amount), amountValue > 0 else {
            alertMessage = "Por favor ingresa un monto válido"
            showAlert = true
            return
        }
        
        guard !description.isEmpty else {
            alertMessage = "Por favor ingresa una descripción"
            showAlert = true
            return
        }
        
        guard let categoryId = selectedCategoryId else {
            alertMessage = "Por favor selecciona una categoría"
            showAlert = true
            return
        }
        
        guard let accountId = selectedAccountId else {
            alertMessage = "Por favor selecciona una cuenta"
            showAlert = true
            return
        }
        
        // Guardar
        let success = await viewModel.saveTransaction(
            amount: amountValue,
            description: description,
            categoryId: categoryId,
            accountId: accountId
        )
        
        if success {
            alertMessage = "Transacción creada correctamente"
            showAlert = true
        } else if let error = viewModel.errorMessage {
            alertMessage = error
            showAlert = true
        }
    }
}

#Preview {
    AddTransactionView(isPresented: .constant(true))
}
