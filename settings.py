#####################################################################
# This is a default config for the app
#
# Use this structure in your project settings, but name it
# MARKDOWNME_CONFIG
# Anything not specified there will be used from this one
#
# DO NOT MODIFY (UNLESS YOU REALLY KNOW WHAT YOU'RE DOING)
#####################################################################

MARKDOWNME_DEFAULT_CONFIG = {
    'FILE_UPLOAD': True,
    'UPLOAD_ROOT': 'markdownme',
    'ALLOWED_FILETYPES': ['image/*', 'application/pdf', 'application/x-rar-compressed', 'application/x-gtar', 'application/x-tar', 'application/x-7z-compressed', 'application/zip'],
    'HISTORY': True,
    'SANITIZE_MARKDOWN': True,
    'IFRAME_PREVIEW': True,
    'SAFE_PREVIEW': False,
    'TWO_PANE_HISTORY': True,
    'CSRF_PROTECTED': True,
    'HASH_FILENAMES': False,
    'MAX_FILE_SIZE': 5,
    'ALLOWED_TAGS': [
        'a', 'abbr', 'acronym', 'b', 'blockquote', 'br', 'button', 'caption', 'cite',
        'code', 'col', 'colgroup', 'dd', 'del', 'div', 'dl', 'dt', 'em', 'figure',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i', 'img', 'ins',
        'li', 'multicol', 'ol', 'p', 'pre', 'q', 's', 'samp', 'section', 'small',
        'source', 'span', 'strike', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
        'tfoot', 'th', 'thead', 'time', 'tr', 'u', 'ul', 'var', 'video',
    ],
    'ALLOWED_STYLES': [
        'background-color', 'color', 'height', 'volume', 'width',
    ],
    'ALLOWED_ATTRIBUTES': {
        u'a': [u'href', u'title'],
        u'acronym': [u'title'],
        u'abbr': [u'title'],
        'h1': ['style', ],
        'h2': ['style', ],
        'h3': ['style', ],
        'h4': ['style', ],
        'h5': ['style', ],
        'h6': ['style', ],
        'span': ['style', ],
        'img': ['src', 'id', 'align', 'alt', 'class', 'is', 'title', 'style', ],
        'audio': ['src', 'type', 'controls', ], 
        'video': ['src', 'type', 'controls', 'width', 'height', 'style', ],
        'source': ['src', 'type', 'media', ],
        },
    'ALLOWED_PROTOCOLS': [u'http', u'https', u'mailto'],        
}
