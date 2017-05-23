from django.contrib import admin

from .models import MarkdownmeMedia, MarkdownmeHistory


# Register your models here.
class MarkdownHistoryAdmin(admin.ModelAdmin):
    list_display = ('markdown_identifier', 'date')

admin.site.register(MarkdownmeMedia)
admin.site.register(MarkdownmeHistory, MarkdownHistoryAdmin)