from django import forms
from authy.models import Profile
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm



class EditProfileForm(forms.ModelForm):
    image = forms.ImageField(required=True)
    first_name = forms.CharField(widget=forms.TextInput(attrs={'class': 'input', 'placeholder': 'First Name'}), required=True)
    last_name = forms.CharField(widget=forms.TextInput(attrs={'class': 'input', 'placeholder': 'Last Name'}), required=True)
    bio = forms.CharField(widget=forms.TextInput(attrs={'class': 'input', 'placeholder': 'Bio'}), required=True)
    url = forms.CharField(widget=forms.TextInput(attrs={'class': 'input', 'placeholder': 'URL'}), required=True)
    location = forms.CharField(widget=forms.TextInput(attrs={'class': 'input', 'placeholder': 'Address'}), required=True)

    class Meta:
        model = Profile
        fields = ['image', 'first_name', 'last_name', 'bio', 'url', 'location']

class UserRegisterForm(UserCreationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'placeholder': 'Enter your username',
            'class': 'input'
        }),
        max_length=50,
        required=True
    )
    
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'placeholder': 'Enter your mail',
            'class': 'input'
        }),
        required=True
    )
    
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Choose a password',
            'class': 'input'
        }),
        required=True
    )
    
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Confirm Password',
            'class': 'input'
        }),
        required=True
    )
    
    image = forms.ImageField(
        widget=forms.FileInput(attrs={
            'class': 'is-hidden',
            'id': 'image-upload'
        }),
        required=True
    )
    
    phone_number = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'input',
            'placeholder': 'Enter your phone number'
        }),
        required=False
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2', 'image', 'phone_number']

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            # Get or update the existing profile created by the signal
            profile = Profile.objects.get(user=user)
            profile.image = self.cleaned_data['image']
            profile.phone_number = self.cleaned_data['phone_number']
            profile.save()
        return user
    
from django import forms
from django.contrib.auth.forms import AuthenticationForm

class CustomLoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'input email-input',
        'placeholder': 'mipashya@gmail.com'
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'input password-input',
        'placeholder': '●●●●●●●'
    }))

    error_messages = {
        'invalid_login': "Invalid login credentials. Please try again.",
        'inactive': "This account is inactive.",
    }
