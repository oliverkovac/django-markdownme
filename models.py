from __future__ import unicode_literals

import os
import uuid

from django.conf import settings
from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
import markdown

from markdownme.settings import MARKDOWNME_DEFAULT_CONFIG

from .fields import MarkdownmeTextField, MarkdownmeIdField

config = getattr(settings, 'MARKDOWNME_CONFIG', MARKDOWNME_DEFAULT_CONFIG)
hash_filenames = config.get('HASH_FILENAMES', MARKDOWNME_DEFAULT_CONFIG['HASH_FILENAMES'])
if hash_filenames:
    import hashlib

class MarkdownmeHistory(models.Model):
    class Meta:
        verbose_name = 'Markdownme History Entry'
        verbose_name_plural = 'Markdownme History Entries'
        
    markdown_text = models.TextField(default = None, null = True, blank = True)
    markdown_identifier = models.UUIDField(editable = False, blank = True, null = True)
    date = models.DateTimeField(auto_now_add = True)

class MarkdownmeEntry(models.Model):
    markdown_text = MarkdownmeTextField(default = None, blank = True, null = True)
    parsed_text = models.TextField(editable = False, default = None, null = True)
    markdown_identifier = MarkdownmeIdField(default = uuid.uuid4, max_length = 32, unique = True)
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        if (self.markdown_text != None):
            
            sanitize = config.get('SANITIZE_MARKDOWN', MARKDOWNME_DEFAULT_CONFIG['SANITIZE_MARKDOWN'])
            self.parsed_text = markdown.markdown(self.markdown_text, output_format = 'html5')
            if sanitize:
                try:
                    import bleach
                except ImportError:
                    print("SANITIZE_MARKDOWN is set to True, but Bleach is not installed! This input will not be saved")
                    return
                allowed_tags = config.get('ALLOWED_TAGS', MARKDOWNME_DEFAULT_CONFIG['ALLOWED_TAGS'])
                allowed_styles = config.get('ALLOWED_STYLES', MARKDOWNME_DEFAULT_CONFIG['ALLOWED_STYLES'])
                allowed_attributes = config.get('ALLOWED_ATTRIBUTES', MARKDOWNME_DEFAULT_CONFIG['ALLOWED_ATTRIBUTES'])
                allowed_protocols = config.get('ALLOWED_PROTOCOLS', MARKDOWNME_DEFAULT_CONFIG['ALLOWED_PROTOCOLS'])
                self.parsed_text = bleach.clean(self.parsed_text, tags = allowed_tags, styles = allowed_styles,
                                                attributes = allowed_attributes, protocols = allowed_protocols)
            MarkdownmeHistory.objects.create(markdown_text = self.markdown_text, markdown_identifier = self.markdown_identifier)
            super(MarkdownmeEntry, self).save(*args, **kwargs)

def get_upload_to(instance, filename):
    upload_root = config.get('UPLOAD_ROOT', MARKDOWNME_DEFAULT_CONFIG['UPLOAD_ROOT'])
    if hash_filenames:
        name, ext = os.path.splitext(filename)
        md5 = hashlib.md5()
        md5.update(name.encode('utf-8'))
        name = md5.hexdigest() + ext
        return os.path.join(upload_root, instance.markdown_identifier, name)
    else:
        return os.path.join(upload_root, instance.markdown_identifier, filename)

class MarkdownmeMedia(models.Model):
    class Meta:
        verbose_name = 'Markdownme Media File'

    media_file = models.FileField(upload_to = get_upload_to, max_length = 100)   
    markdown_identifier = models.UUIDField(editable = False, blank = True, null = True)
    
    def filename(self):
        return os.path.basename(self.media_file.name)
    
    def __str__(self):
        return self.filename()

@receiver(pre_delete, sender = MarkdownmeMedia)
def delete_media_file(instance, **kwargs):
    instance.media_file.delete()
    upload_root = config.get('UPLOAD_ROOT', MARKDOWNME_DEFAULT_CONFIG['UPLOAD_ROOT'])
    mediaDirectory = os.path.join(settings.MEDIA_ROOT, upload_root, str(instance.markdown_identifier).replace('-', ''))
    try:
        if not os.listdir(mediaDirectory):
            os.rmdir(mediaDirectory)
    except FileNotFoundError:
        print("There was a problem removing a seemingly empty folder probably caused by inconsistency of Markdownme settings and media file data in database")
    
#called for every model delete in the app!
#basically solves the cascading deletion + removal of empty media folder left
#might be a performance issue in a big architecture
#specifying an abstract class as a sender doesnt trigger the signal and this seems to be the only simple solution
#for subclass in MarkdownmeEntry.__subclasses__():
    #pre_delete.connect(delete_markdown_instance, subclass)
@receiver(pre_delete)
def delete_markdown_instance(instance, sender, **kwargs):
    if not issubclass(sender, MarkdownmeEntry):
        return
    
    for media_file in MarkdownmeMedia.objects.filter(markdown_identifier = instance.markdown_identifier):
        media_file.delete()
    
    for history_entry in MarkdownmeHistory.objects.filter(markdown_identifier = instance.markdown_identifier):
        history_entry.delete()
        
    os.rmdir('%s/%s' % (settings.MEDIA_ROOT, str(instance.markdown_identifier).replace('-', '')))