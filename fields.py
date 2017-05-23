from django.db import models
from django.forms.widgets import HiddenInput

from .widgets import MarkdownmeWidget


class MarkdownmeTextField(models.TextField):
    def formfield(self, **kwargs):
        kwargs['widget'] = MarkdownmeWidget
        return super(MarkdownmeTextField, self).formfield(**kwargs)

class MarkdownmeIdField(models.UUIDField):
    def formfield(self, **kwargs):
        kwargs['widget'] = HiddenInput
        return super(MarkdownmeIdField, self).formfield(**kwargs)
