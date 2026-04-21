from django.db import migrations


def seed_categories(apps, schema_editor):
    Category = apps.get_model("marketplace", "Category")
    for name, description in [
        ("Textbooks", "Course books and study materials."),
        ("Electronics", "Laptops, calculators, chargers, and devices."),
        ("Dorm room", "Furniture, storage, lamps, and room supplies."),
        ("Bikes", "Campus transport and accessories."),
    ]:
        Category.objects.get_or_create(name=name, defaults={"description": description})


def remove_categories(apps, schema_editor):
    Category = apps.get_model("marketplace", "Category")
    Category.objects.filter(name__in=["Textbooks", "Electronics", "Dorm room", "Bikes"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("marketplace", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_categories, remove_categories),
    ]
