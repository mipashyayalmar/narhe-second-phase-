# post/templatetags/post_tags.py
from django import template
from post.models import Likes

register = template.Library()

@register.filter
def has_liked(post, user):
    if not user.is_authenticated:
        return False
    return Likes.objects.filter(post=post, user=user).exists()