# Generated by Django 4.2.7 on 2023-11-16 19:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chess', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='users',
            name='login',
            field=models.CharField(default='login_test', max_length=16),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='lobbies',
            name='id_game',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='chess.games'),
        ),
        migrations.AlterField(
            model_name='lobbies',
            name='id_users',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='chess.users'),
        ),
        migrations.AlterField(
            model_name='users',
            name='email',
            field=models.CharField(max_length=32),
        ),
        migrations.AlterField(
            model_name='users',
            name='id_games',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='chess.games'),
        ),
    ]