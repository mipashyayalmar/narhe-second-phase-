# comment/forms.py
from django.contrib.auth.models import User
from comment.models import Comment
from django import forms

class NewCommentForm(forms.ModelForm):
    body = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'input', 
            'placeholder': 'Write comment',
            'id': 'comment-body-input'
        }), 
        required=True
    )
    parent = forms.IntegerField(
        widget=forms.HiddenInput(attrs={
            'id': 'parent-id-input'
        }),
        required=False
    )
    
    class Meta:
        model = Comment
        fields = ("body",)