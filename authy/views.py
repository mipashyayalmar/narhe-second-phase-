from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import Http404, HttpResponseRedirect
from django.core.paginator import Paginator
from django.db import transaction
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.contrib import messages
from django.contrib.auth import authenticate, login
from post.models import Post, Follow, Stream
from authy.models import Profile
from .forms import EditProfileForm, UserRegisterForm
from django.urls import resolve
from comment.models import Comment

from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from notification.models import Notification
from django.template.loader import render_to_string


@login_required
def UserProfile(request, username):
    # Ensure requesting user has a profile if authenticated
    if request.user.is_authenticated:
        Profile.objects.get_or_create(user=request.user)

    if username == "AnonymousUser":
        raise Http404("Profile does not exist")
    
    # Get the profile user
    user = get_object_or_404(User, username=username)
    profile = Profile.objects.get(user=user)
    
    # Determine which posts to show based on URL
    url_name = resolve(request.path).url_name
    posts = Post.objects.filter(user=user).order_by('-posted') if url_name == 'profile' else profile.favourite.all()
    
    # Get follow status if user is authenticated
    follow_status = False
    if request.user.is_authenticated and request.user != user:
        follow_status = Follow.objects.filter(following=user, follower=request.user).exists()

    # Profile stats
    posts_count = Post.objects.filter(user=user).count()
    followers_count = Follow.objects.filter(following=user).count()
    following_count = Follow.objects.filter(follower=user).count()

    # Pagination
    paginator = Paginator(posts, 8)
    page_number = request.GET.get('page')
    posts_paginator = paginator.get_page(page_number)

    context = {
        'posts': posts,
        'profile': profile,
        'posts_paginator': posts_paginator,
        'follow_status': follow_status,
        'posts_count': posts_count,
        'followers_count': followers_count,
        'following_count': following_count,
    }

    return render(request, 'profile.html', context)

def EditProfile(request):
    user = request.user.id
    profile = Profile.objects.get(user__id=user)

    if request.method == "POST":
        form = EditProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            profile.image = form.cleaned_data.get('image')
            profile.first_name = form.cleaned_data.get('first_name')
            profile.last_name = form.cleaned_data.get('last_name')
            profile.location = form.cleaned_data.get('location')
            profile.url = form.cleaned_data.get('url')
            profile.bio = form.cleaned_data.get('bio')
            profile.save()
            return redirect('profile', profile.user.username)
    else:
        form = EditProfileForm(instance=request.user.profile)

    context = {
        'form':form,
    }
    return render(request, 'editprofile.html', context)




def follow(request, username, option):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'User not authenticated'}, status=401)

    following = get_object_or_404(User, username=username)

    try:
        if int(option) == 1:  # Follow
            f, created = Follow.objects.get_or_create(follower=user, following=following)
            if created:
                # Create stream entries for the followed user's recent posts
                posts = Post.objects.filter(user=following)[:25]
                with transaction.atomic():
                    for post in posts:
                        stream = Stream(post=post, user=user, date=post.posted, following=following)
                        stream.save()
                # Create notification
                notify = Notification(sender=user, user=following, notification_types=3)
                notify.save()
            return JsonResponse({'status': 'success', 'action': 'follow'})
        elif int(option) == 0:  # Unfollow
            f = Follow.objects.filter(follower=user, following=following).first()
            if f:
                f.delete()
                Stream.objects.filter(following=following, user=user).delete()
                # Delete notification
                Notification.objects.filter(sender=user, user=following, notification_types=3).delete()
            return JsonResponse({'status': 'success', 'action': 'unfollow'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid option'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)




def register(request):
    if request.method == "POST":
        form = UserRegisterForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            
            # Automatically Log In The User
            user = authenticate(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password1']
            )
            login(request, user)
            
            messages.success(request, 'Your account was created successfully!')
            return redirect('index')  # Redirect to index instead of rendering
            
    elif request.user.is_authenticated:
        return redirect('index')
    else:
        form = UserRegisterForm()
    
    context = {
        'form': form,
    }
    return render(request, 'sign-up.html', context)


def setting(request):
    return render(request, 'base/setting.html') 