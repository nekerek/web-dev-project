from django.db import migrations


DEFAULT_CATEGORIES = [
    ("Cinema", "cinema", "Movie screenings and premieres."),
    ("Theater", "theater", "Stage performances and student productions."),
    ("Concerts", "concerts", "Live music events and performances."),
    ("Stand Up", "stand-up", "Comedy nights and open mic sessions."),
    ("Museums", "museums", "Exhibitions, galleries, and cultural visits."),
    ("Sports", "sports", "Matches, tournaments, and athletic events."),
    ("Workshops", "workshops", "Hands-on learning sessions and masterclasses."),
    ("Tours", "tours", "Guided trips and campus excursions."),
    ("Entertainment", "entertainment", "General fun activities and mixed shows."),
    ("Music", "music", "DJ sets, jam sessions, and music nights."),
    ("Gaming", "gaming", "Esports, LAN parties, and gaming tournaments."),
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model("tickets", "Category")
    for name, slug, description in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            slug=slug,
            defaults={"name": name, "description": description},
        )


def remove_categories(apps, schema_editor):
    Category = apps.get_model("tickets", "Category")
    Category.objects.filter(
        slug__in=[slug for _, slug, _ in DEFAULT_CATEGORIES]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("tickets", "0004_user_preferences"),
    ]

    operations = [
        migrations.RunPython(seed_categories, remove_categories),
    ]
