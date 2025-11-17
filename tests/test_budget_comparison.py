def test_budget_vs_actual_noviembre(client):
    """Validate /api/budget-plans/comparison/Noviembre aggregates budget and actual amounts correctly."""
    response = client.get("/api/budget-plans/comparison/Noviembre")
    assert response.status_code == 200
    data = response.json()

    # Basic structure checks
    assert data["cycle_name"] == "Noviembre"
    assert "categories" in data and isinstance(data["categories"], list)
    assert "summary" in data

    cats = {c["category_name"]: c for c in data["categories"]}
    assert "Salario" in cats
    assert "Comida" in cats

    salario = cats["Salario"]
    comida = cats["Comida"]

    # Budgeted amounts as seeded
    assert salario["budgeted"] == 10000.0
    assert comida["budgeted"] == 500.0

    # Actual amounts from transactions
    assert salario["actual"] == 8000.0
    assert comida["actual"] == 450.0

    # Variance = budgeted - actual
    assert salario["variance"] == 2000.0
    assert comida["variance"] == 50.0

    # Compliance percentages rounded to 1 decimal
    assert salario["compliance_percentage"] == 80.0  # 8000 / 10000 * 100
    assert comida["compliance_percentage"] == 90.0   # 450 / 500 * 100

    summary = data["summary"]
    assert summary["total_budgeted_income"] == 10000.0
    assert summary["total_actual_income"] == 8000.0
    assert summary["total_budgeted_expense"] == 500.0
    assert summary["total_actual_expense"] == 450.0

    # Savings = income - expense
    assert summary["total_budgeted_saving"] == 9500.0
    assert summary["total_actual_saving"] == 7550.0

    # Overall compliance = (total_actual_income + total_actual_expense) / (total_budgeted_income + total_budgeted_expense)
    expected_overall = (8000.0 + 450.0) / (10000.0 + 500.0) * 100  # ≈ 77.0
    assert summary["overall_compliance"] == round(expected_overall, 1)