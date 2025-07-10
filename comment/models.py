# comment/models.py
from django.db import models
from django.contrib.auth.models import User
from post.models import Post
from django.db.models.signals import post_save, post_delete
from notification.models import Notification


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    body = models.TextField()
    date = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.body[:20]}"
    
    @property
    def children(self):
        return Comment.objects.filter(parent=self).order_by('-date')
    
    @property
    def is_parent(self):
        if self.parent is None:
            return True
        return False

    def user_comment_post(sender, instance, *args, **kwargs):
        comment = instance
        post = comment.post
        text_preview = comment.body[:90]
        sender = comment.user
        
        # Only notify for top-level comments
        if comment.parent is None:
            notify = Notification(post=post, sender=sender, user=post.user, text_preview=text_preview, notification_types=2)
            notify.save()

    def user_del_comment_post(sender, instance, *args, **kwargs):
        comment = instance
        post = comment.post
        sender = comment.user
        
        # Only delete notification for top-level comments
        if comment.parent is None:
            notify = Notification.objects.filter(post=post, sender=sender, user=post.user, notification_types=2)
            notify.delete()

post_save.connect(Comment.user_comment_post, sender=Comment)
post_delete.connect(Comment.user_del_comment_post, sender=Comment)