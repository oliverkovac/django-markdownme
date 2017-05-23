from django.conf import settings
from django.forms import widgets
from django.forms.utils import flatatt
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from markdownme.settings import MARKDOWNME_DEFAULT_CONFIG


class MarkdownmeWidget(widgets.Textarea):
    template_name = 'markdownme/textedit.html'

    class Media():
        css = {
            'all': (
                'markdownme/css/dropzone.min.css',
                'markdownme/css/markdownme.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
                )
            }
        js = (
            'markdownme/js/dropzone.min.js',
            'markdownme/js/markdownme.min.js',
            'markdownme/js/diff.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/showdown/1.6.4/showdown.min.js',
            )

    def render(self, name, value, attrs=[]):
        if value is None:
            value = ''
        
        config = getattr(settings, 'MARKDOWNME_CONFIG', MARKDOWNME_DEFAULT_CONFIG)
        file_upload_allowed = config.get('FILE_UPLOAD', MARKDOWNME_DEFAULT_CONFIG['FILE_UPLOAD'])
        upload_root = config.get('UPLOAD_ROOT', MARKDOWNME_DEFAULT_CONFIG['UPLOAD_ROOT'])
        if len(upload_root) > 0 and upload_root[-1:] != '/':
            upload_root = upload_root + '/'
        allowed_file_types = config.get('ALLOWED_FILETYPES', MARKDOWNME_DEFAULT_CONFIG['ALLOWED_FILETYPES'])
        allowed_file_types = ','.join(allowed_file_types)
        history_allowed = config.get('HISTORY', MARKDOWNME_DEFAULT_CONFIG['HISTORY'])
        iframe_preview = config.get('IFRAME_PREVIEW', MARKDOWNME_DEFAULT_CONFIG['IFRAME_PREVIEW'])
        safe_preview = config.get('SAFE_PREVIEW', MARKDOWNME_DEFAULT_CONFIG['SAFE_PREVIEW'])
        two_pane_history = config.get('TWO_PANE_HISTORY', MARKDOWNME_DEFAULT_CONFIG['TWO_PANE_HISTORY'])
        max_filesize = config.get('MAX_FILE_SIZE', MARKDOWNME_DEFAULT_CONFIG['MAX_FILE_SIZE'])
        
        attrs['name'] = name
        context = {
            'attrs': flatatt(self.build_attrs(attrs)),
            'value': value,
            'file_upload_allowed': file_upload_allowed,
            'markdownme_media_root': settings.MEDIA_URL + upload_root,
            'allowed_file_types': allowed_file_types,
            'history_allowed': history_allowed,
            'safe_preview': safe_preview,
            'iframe_preview': iframe_preview,
            'two_pane_history': two_pane_history,
            'max_filesize': max_filesize,
        }
        return mark_safe(render_to_string(self.template_name, context))