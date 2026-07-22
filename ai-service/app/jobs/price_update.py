"""Naive demand-based repricing: nudges price based on how well a product is selling.

Not a real pricing model - a simple, explainable heuristic for demo purposes:
- Best sellers (sold >= 100) get a small price bump, capped at oldPrice.
- Slow movers (sold < 20) get a small discount, floored at 50% of oldPrice.
- Everything else is left untouched.
"""

from sqlalchemy import text

from ..db import SessionLocal

BEST_SELLER_THRESHOLD = 100
SLOW_MOVER_THRESHOLD = 20
BUMP_RATE = 1.02
DISCOUNT_RATE = 0.97


def run():
    session = SessionLocal()
    updated = 0
    try:
        rows = session.execute(
            text("SELECT id, price, oldPrice, sold FROM `Product`")
        ).mappings().all()

        for row in rows:
            new_price = None

            if row["sold"] >= BEST_SELLER_THRESHOLD:
                candidate = round(row["price"] * BUMP_RATE)
                new_price = min(candidate, row["oldPrice"])
            elif row["sold"] < SLOW_MOVER_THRESHOLD:
                candidate = round(row["price"] * DISCOUNT_RATE)
                floor = round(row["oldPrice"] * 0.5)
                new_price = max(candidate, floor)

            if new_price is not None and new_price != row["price"]:
                session.execute(
                    text("UPDATE `Product` SET price = :price WHERE id = :id"),
                    {"price": new_price, "id": row["id"]},
                )
                updated += 1

        session.commit()
        return {"checked": len(rows), "updated": updated}
    finally:
        session.close()
