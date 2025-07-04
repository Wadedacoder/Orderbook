# Generated by Django 5.2.1 on 2025-05-12 16:34

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Bombay_Exchange', '0005_listings_token_alter_stocks_token'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Trades',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('quantity', models.IntegerField()),
                ('Token', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Bombay_Exchange.stocks')),
                ('ask_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trades_ask', to=settings.AUTH_USER_MODEL)),
                ('bid_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trades_bid', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.DeleteModel(
            name='Users',
        ),
        migrations.AddField(
            model_name='listings',
            name='user',
            field=models.ForeignKey(default=12, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
