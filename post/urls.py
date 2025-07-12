# post/urls.py
from django.urls import path
from directs import views as directs_views  # Alias to avoid confusion
from post.views import index, NewPost, PostDetail, Tags, like, favourite, post_comments, users_json, pages_json
from uuid import UUID
from django.conf import settings
from django.conf.urls.static import static
from . import views
from django.views.decorators.cache import cache_page
# Converter for UUID in URLs
class UUIDConverter:
    regex = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

    def to_python(self, value):
        return UUID(value)

    def to_url(self, value):
        return str(value)

# Register the converter
from django.urls import register_converter
register_converter(UUIDConverter, 'uuid')

urlpatterns = [
    path('', index, name='index'),
    path('newpost', NewPost, name='newpost'),
    path('post/<uuid:post_id>/', PostDetail, name='post-details'),
    path('post/<uuid:post_id>/comment/', PostDetail, name='post-comment'),
    path('tag/<slug:tag_slug>/', Tags, name='tags'),
    path('<uuid:post_id>/like/', like, name='like'),
    path('<uuid:post_id>/favourite/', favourite, name='favourite'),
    path('api/posts/<uuid:post_id>/comments/', post_comments, name='post_comments'),
    path('like/<uuid:post_id>/', views.like, name='like'),

     path('assets/data/api/users/users.json', cache_page(300)(users_json)),  # 5 minute cache
    path('assets/data/api/pages/pages.json', pages_json),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)