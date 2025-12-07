# scripts/load_products.py

import os
import django
import csv
from decimal import Decimal
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# 🔴 Yaha apne project ka settings module daalo
# Example: 'config.settings' ya 'myproject.settings'
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")

django.setup()

# 🔴 Yaha apne app ka naam daalo jaha Category/Product models hain
from products.models import Category, Product


# CSV_PATH = "products.csv"  # agar file root me hai jaha manage.py hai
CSV_PATH = BASE_DIR / "scripts" / "products.csv"


def load_data_from_csv():
    products_to_create = []
    categories_cache = {}  # (name, slug) -> Category instance

    with open(CSV_PATH, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            category_name = row["category_name"].strip()
            category_slug = row["category_slug"].strip()

            # ✅ Category get_or_create with cache
            key = (category_name, category_slug)
            if key in categories_cache:
                category = categories_cache[key]
            else:
                category, created = Category.objects.get_or_create(
                    name=category_name,
                    slug=category_slug,
                )
                categories_cache[key] = category

            # ✅ Check if product slug already exists – skip if yes
            if Product.objects.filter(slug=row["slug"].strip()).exists():
                print(f"Skipping existing product: {row['slug']}")
                continue

            product = Product(
                title=row["title"].strip(),
                slug=row["slug"].strip(),
                description=row["description"].strip(),
                price=Decimal(row["price"]),
                category=category,
                inventory=int(row["inventory"]),
            )
            products_to_create.append(product)

    # ✅ Bulk create for performance
    if products_to_create:
        Product.objects.bulk_create(products_to_create)
        print(f"Inserted {len(products_to_create)} products.")
    else:
        print("No new products to insert.")


if __name__ == "__main__":
    load_data_from_csv()
