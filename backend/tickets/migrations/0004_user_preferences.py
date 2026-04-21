from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0003_event_organization'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='email_notifications',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='user',
            name='event_reminders',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='user',
            name='marketing_updates',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='preferred_category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='subscribers', to='tickets.category'),
        ),
    ]
