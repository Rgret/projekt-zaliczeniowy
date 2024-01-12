# Generated by Django 4.2.7 on 2024-01-12 14:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('chess', '0004_alter_lobbies_id_host_alter_lobbies_id_player_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lobbies',
            name='id_player',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='player', to=settings.AUTH_USER_MODEL),
        ),
    ]