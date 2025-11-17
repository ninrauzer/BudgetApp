from datetime import date

import pytest

# Note: defer importing Transaction until inside test functions to avoid potential recursion issues during app startup.


def _create_account(client, name: str, type_: str = "cash", balance: float = 0.0):
    payload = {
        "name": name,
        "type": type_,
        "balance": balance,
        "currency": "PEN",
        "icon": "wallet",
        "is_active": True,
    }
    resp = client.post("/api/accounts", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()["id"], resp.json()


def test_transfer_end_to_end(client, db_session):
    """Full lifecycle: create accounts -> create transfer -> list/get -> delete -> verify cleanup."""
    # Create source and destination accounts
    from_id, from_acc = _create_account(client, "Cuenta Origen", "cash", 1000.0)
    to_id, to_acc = _create_account(client, "Cuenta Destino", "cash", 500.0)

    # Create transfer
    transfer_payload = {
        "from_account_id": from_id,
        "to_account_id": to_id,
        "amount": 123.45,
        "date": date.today().isoformat(),
        "description": "Test e2e"
    }
    create_resp = client.post("/transfers/", json=transfer_payload)
    assert create_resp.status_code == 200, create_resp.text
    created = create_resp.json()
    transfer_id = created["transfer_id"]
    assert created["amount"] == pytest.approx(123.45)
    assert created["from_account_name"] == from_acc["name"]
    assert created["to_account_name"] == to_acc["name"]

    # List transfers
    list_resp = client.get("/transfers/")
    assert list_resp.status_code == 200
    transfers = list_resp.json()
    assert any(t["transfer_id"] == transfer_id for t in transfers)

    # Get detail
    detail_resp = client.get(f"/transfers/{transfer_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["transfer_id"] == transfer_id
    assert detail["amount"] == pytest.approx(123.45)
    assert detail["from_account"]["name"] == from_acc["name"]
    assert detail["to_account"]["name"] == to_acc["name"]

    # Delete transfer
    delete_resp = client.delete(f"/transfers/{transfer_id}")
    assert delete_resp.status_code == 200
    body = delete_resp.json()
    assert body["deleted_transactions"] == 2

    # Ensure transfer detail now 404
    not_found_resp = client.get(f"/transfers/{transfer_id}")
    assert not_found_resp.status_code == 404

    # Verify underlying transactions removed from DB
    from app.models.transaction import Transaction
    leftover = db_session.query(Transaction).filter(Transaction.transfer_id == transfer_id).count()
    assert leftover == 0


@pytest.mark.parametrize("amount", [0, -10])
def test_transfer_invalid_amount(client, db_session, amount):
    """Reject zero or negative amount transfers."""
    a_id, _ = _create_account(client, "Account A")
    b_id, _ = _create_account(client, "Account B")
    payload = {
        "from_account_id": a_id,
        "to_account_id": b_id,
        "amount": amount,
        "date": date.today().isoformat(),
        "description": "Invalid amount test"
    }
    resp = client.post("/transfers/", json=payload)
    # Pydantic validation should fail before reaching route (gt=0)
    assert resp.status_code == 422


def test_transfer_same_account_rejected(client):
    """Cannot transfer between the same account."""
    a_id, _ = _create_account(client, "Solo Account")
    payload = {
        "from_account_id": a_id,
        "to_account_id": a_id,
        "amount": 10,
        "date": date.today().isoformat(),
        "description": "Same account"
    }
    resp = client.post("/transfers/", json=payload)
    assert resp.status_code == 400
    assert "Cannot transfer to the same account" in resp.text


def test_transfer_missing_account(client):
    """Fails if destination account doesn't exist."""
    src_id, _ = _create_account(client, "Source")
    payload = {
        "from_account_id": src_id,
        "to_account_id": 9999,  # non-existent
        "amount": 10,
        "date": date.today().isoformat(),
        "description": "Missing dest"
    }
    resp = client.post("/transfers/", json=payload)
    assert resp.status_code == 404
    assert "Destination account" in resp.text
