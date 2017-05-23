# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-05-23 19:03
from __future__ import unicode_literals

from django.db import migrations, models
import markdownme.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MarkdownmeHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('markdown_text', models.TextField(blank=True, default=None, null=True)),
                ('markdown_identifier', models.UUIDField(blank=True, editable=False, null=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Markdownme History Entries',
                'verbose_name': 'Markdownme History Entry',
            },
        ),
        migrations.CreateModel(
            name='MarkdownmeMedia',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('media_file', models.FileField(upload_to=markdownme.models.get_upload_to)),
                ('markdown_identifier', models.UUIDField(blank=True, editable=False, null=True)),
            ],
            options={
                'verbose_name': 'Markdownme Media File',
            },
        ),
    ]