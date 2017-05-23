import os.path

from django.conf import settings
from django.conf import settings
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from markdownme.settings import MARKDOWNME_DEFAULT_CONFIG

from .models import MarkdownmeMedia, MarkdownmeHistory


config = getattr(settings, 'MARKDOWNME_CONFIG', MARKDOWNME_DEFAULT_CONFIG)
csrf_protected = config.get('CSRF_PROTECTED', MARKDOWNME_DEFAULT_CONFIG['SANITIZE_MARKDOWN'])
if csrf_protected:
    def upload_file(request):
        if request.method == 'POST':
            markdown_identifier = request.POST.get('markdown_identifier', None)
            if markdown_identifier is None:
                return HttpResponse(status=404)
            
            createdFile = MarkdownmeMedia.objects.create(media_file = request.FILES['file'], markdown_identifier = markdown_identifier)
            json_data = dict(url = createdFile.media_file.url)
            return JsonResponse(json_data)
            
        return HttpResponse(status=404)

    def delete_file(request):
        if request.method == 'POST':
            config = getattr(settings, 'MARKDOWNME_CONFIG', MARKDOWNME_DEFAULT_CONFIG)
            upload_root = config.get('UPLOAD_ROOT', MARKDOWNME_DEFAULT_CONFIG['UPLOAD_ROOT'])
            filename = request.POST.get('filename', '')
            markdown_identifier = request.POST.get('markdown_identifier', None)
            fileToDelete = get_object_or_404(MarkdownmeMedia, media_file = os.path.join(upload_root, markdown_identifier, filename), markdown_identifier = markdown_identifier)
            fileToDelete.delete()
            return HttpResponse(status=200)
            
        return HttpResponse(status=404)
else:
    @csrf_exempt
    def upload_file(request):
        if request.method == 'POST':
            markdown_identifier = request.POST.get('markdown_identifier', None)
            if markdown_identifier is None:
                return HttpResponse(status=404)
            
            createdFile = MarkdownmeMedia.objects.create(media_file = request.FILES['file'], markdown_identifier = markdown_identifier)
            json_data = dict(url = createdFile.media_file.url)
            return JsonResponse(json_data)
            
        return HttpResponse(status=404)

    @csrf_exempt
    def delete_file(request):
        if request.method == 'POST':
            config = getattr(settings, 'MARKDOWNME_CONFIG', MARKDOWNME_DEFAULT_CONFIG)
            upload_root = config.get('UPLOAD_ROOT', MARKDOWNME_DEFAULT_CONFIG['UPLOAD_ROOT'])
            filename = request.POST.get('filename', '')
            markdown_identifier = request.POST.get('markdown_identifier', None)
            fileToDelete = get_object_or_404(MarkdownmeMedia, media_file = os.path.join(upload_root, markdown_identifier, filename), markdown_identifier = markdown_identifier)
            fileToDelete.delete()
            return HttpResponse(status=200)


def file_list(request):
    if request.method == 'GET':
        markdown_identifier = request.GET.get('markdown_identifier', None)
        data = []
        for file in MarkdownmeMedia.objects.filter(markdown_identifier = markdown_identifier):
            data.append(dict(url = file.media_file.url, size = file.media_file.size))
        json_data = dict(files = data)
        return JsonResponse(json_data)
        
    return HttpResponse(status=404)

def history_list(request):
    if request.method == 'GET':
        markdown_identifier = request.GET.get('markdown_identifier', None)
        data = []
        for history_entry in MarkdownmeHistory.objects.filter(markdown_identifier = markdown_identifier).order_by('-date'):
            data.append(dict(text = history_entry.markdown_text, date = history_entry.date.strftime('%b %d, %Y %H:%M')))
        json_data = dict(entries = data)
        return JsonResponse(json_data)
        
    return HttpResponse(status=404)