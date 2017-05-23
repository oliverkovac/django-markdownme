from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^md-upload', views.upload_file, name='dropzone_upload'),
    url(r'^md-delete', views.delete_file, name='dropzone_delete'),
    url(r'^md-filelist', views.file_list, name='dropzone_filelist'),
    url(r'^md-history', views.history_list, name='markdown_history'),
]