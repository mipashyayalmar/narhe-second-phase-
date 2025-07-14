from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import HttpResponseRedirect

from post.models import Post, Tag, Follow, Stream, Likes
from django.contrib.auth.models import User
from post.forms import NewPostform
from authy.models import Profile
from django.urls import resolve
from comment.models import Comment
from comment.forms import NewCommentForm
from django.core.paginator import Paginator

from django.db.models import Q
# from post.models import Post, Follow, Stream
# post/views.py
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from django.core.paginator import Paginator
from post.models import Post, Stream, Follow
from comment.models import Comment
from comment.forms import NewCommentForm
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
import logging

logger = logging.getLogger(__name__)



from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse
from django.db.models import Q
from django.core.paginator import Paginator
import logging

logger = logging.getLogger(__name__)

def index(request):
    user = request.user
    all_users = User.objects.all()
    profiles = Profile.objects.all()
    
    # Initialize variables
    followed_users = []
    form = NewCommentForm()
    
    # For unauthenticated users - show all public posts
    if not user.is_authenticated:
        post_items = Post.objects.all().order_by('-posted')
    else:
        # For authenticated users - show personalized feed
        all_users = all_users.exclude(id=user.id)
        followed_users = Follow.objects.filter(follower=user).values_list('following__id', flat=True)
        
        posts = Stream.objects.filter(user=user)
        group_ids = [post.post_id for post in posts]
        post_items = Post.objects.filter(id__in=group_ids).all().order_by('-posted')

    # Handle POST requests (comments)
    if request.method == "POST":
        if not user.is_authenticated:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)
            return redirect('login')
            
        form = NewCommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = user
            post_id = request.POST.get('post_id')
            post = get_object_or_404(Post, id=post_id)
            comment.post = post
            parent_id = request.POST.get('parent')
            if parent_id:
                parent = get_object_or_404(Comment, id=parent_id)
                comment.parent = parent
            comment.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': True, 'comment_id': str(comment.id)})
            return HttpResponseRedirect(reverse('index'))
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': form.errors}, status=400)
            logger.error(f"Form errors: {form.errors}")

    # Handle search
    query = request.GET.get('q')
    if query:
        users = User.objects.filter(Q(username__icontains=query))
        paginator = Paginator(users, 6)
        page_number = request.GET.get('page')
        users_paginator = paginator.get_page(page_number)
    else:
        users_paginator = None

    context = {
        'post_items': post_items,
        'profiles': profiles,
        'all_users': all_users,
        'followed_users': followed_users,
        'form': form,
        'users_paginator': users_paginator,
    }
    return render(request, 'index.html', context)

@login_required
def PostDetail(request, post_id):
    user = request.user
    post = get_object_or_404(Post, id=post_id)
    comments = Comment.objects.filter(post=post, parent=None).order_by('-date')

    if request.method == "POST":
        form = NewCommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.user = user
            parent_id = request.POST.get('parent')
            if parent_id:
                parent = get_object_or_404(Comment, id=parent_id)
                comment.parent = parent
            comment.save()
            return HttpResponseRedirect(reverse('post-details', args=[post.id]))
    else:
        form = NewCommentForm()

    context = {
        'post': post,
        'form': form,
        'comments': comments
    }
    return render(request, 'postdetail.html', context)

def post_comments(request, post_id):
    logger.info(f"Received request for comments on post_id: {post_id}")
    try:
        post = get_object_or_404(Post, id=post_id)
        comments = Comment.objects.filter(post=post, parent=None)
        comments_data = []
        for comment in comments:
            comments_data.append({
                'id': comment.id,
                'user': {
                    'username': comment.user.username,
                    'profile_image': comment.user.profile.image.url if comment.user.profile.image else None
                },
                'body': comment.body,
                'date': comment.date.isoformat(),
                'children': [
                    {
                        'id': reply.id,
                        'user': {
                            'username': reply.user.username,
                            'profile_image': reply.user.profile.image.url if reply.user.profile.image else None
                        },
                        'body': reply.body,
                        'date': reply.date.isoformat(),
                        'children': []
                    } for reply in comment.replies.all()
                ]
            })
        logger.info(f"Returning {len(comments_data)} comments for post_id: {post_id}")
        return JsonResponse(comments_data, safe=False)
    except Exception as e:
        logger.error(f"Error fetching comments for post_id {post_id}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
@login_required
def NewPost(request):
    user = request.user
    profile = get_object_or_404(Profile, user=user)
    tags_obj = []
    
    if request.method == "POST":
        form = NewPostform(request.POST, request.FILES)
        if form.is_valid():
            picture = form.cleaned_data.get('picture')
            caption = form.cleaned_data.get('caption')
            tag_form = form.cleaned_data.get('tags')
            tag_list = list(tag_form.split(','))

            for tag in tag_list:
                t, created = Tag.objects.get_or_create(title=tag)
                tags_obj.append(t)
            p, created = Post.objects.get_or_create(picture=picture, caption=caption, user=user)
            p.tags.set(tags_obj)
            p.save()
            return redirect('profile', request.user.username)
    else:
        form = NewPostform()
    context = {
        'form': form
    }
    return render(request, 'newpost.html', context)

@login_required
def Tags(request, tag_slug):
    tag = get_object_or_404(Tag, slug=tag_slug)
    posts = Post.objects.filter(tags=tag).order_by('-posted')

    context = {
        'posts': posts,
        'tag': tag

    }
    return render(request, 'tag.html', context)

from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.conf import settings

@login_required
def like(request, post_id):
    if request.method != 'POST':
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return HttpResponseBadRequest("Only POST requests are allowed")
        return HttpResponseRedirect(reverse('index'))

    user = request.user
    post = get_object_or_404(Post, id=post_id)

    try:
        with transaction.atomic():
            # Check if user already liked the post
            like_instance, created = Likes.objects.get_or_create(
                user=user,
                post=post,
                defaults={'user': user, 'post': post}
            )

            if not created:
                like_instance.delete()
                post.likes = max(0, post.likes - 1)  # Prevent negative likes
            else:
                post.likes += 1

            post.save()

            # Get the last 4 likers
            last_likers = Likes.objects.filter(post=post)\
                                     .select_related('user')\
                                     .order_by('-id')[:4]

            # Prepare response data
            response_data = {
                'success': True,
                'likes': post.likes,
                'liked': created,
                'likers': [{
                    'id': like.user.id,
                    'name': like.user.username,
                    'avatar': get_avatar_url(like.user)
                } for like in last_likers],
                'likers_count': post.likes
            }

            return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': 'An error occurred while processing your request'
        }, status=500)

def get_avatar_url(user):
    """Helper function to safely get user avatar URL with fallback"""
    if hasattr(user, 'profile') and hasattr(user.profile, 'avatar') and user.profile.avatar:
        return user.profile.avatar.url
    return f"{settings.STATIC_URL}assets/img/avatars/default.jpg"
@login_required
def favourite(request, post_id):
    user = request.user
    post = Post.objects.get(id=post_id)
    profile = Profile.objects.get(user=user)

    if profile.favourite.filter(id=post_id).exists():
        profile.favourite.remove(post)
    else:
        profile.favourite.add(post)
    return HttpResponseRedirect(reverse('post-details', args=[post_id]))



# Add to your views.py

@login_required
def users_json(request):
    users = User.objects.all().values('id', 'username', 'email')
    return JsonResponse(list(users), safe=False)

@login_required
def pages_json(request):
    # Create your pages data structure here
    pages = []
    return JsonResponse(pages, safe=False)


from django.core.cache import caches
from django.views import View

class RateLimitedJsonView(View):
    RATE_LIMIT = 10  # 10 requests
    RATE_LIMIT_PERIOD = 60  # per minute

    def dispatch(self, request, *args, **kwargs):
        cache = caches['default']
        ip = request.META.get('REMOTE_ADDR')
        key = f'rate_limit:{ip}:{request.path}'
        
        current = cache.get(key, 0)
        if current >= self.RATE_LIMIT:
            return JsonResponse(
                {'error': 'Too many requests'}, 
                status=429
            )
        
        cache.set(key, current + 1, self.RATE_LIMIT_PERIOD)
        return super().dispatch(request, *args, **kwargs)