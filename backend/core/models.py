from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(_('email address'), unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=20, default="bank") # bank, gov, admin
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Prediction(models.Model):
    ref_id = models.CharField(max_length=100, unique=True, blank=True, null=True, db_index=True)
    applicant_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Inputs
    age = models.IntegerField()
    workclass = models.CharField(max_length=100)
    education = models.CharField(max_length=100)
    occupation = models.CharField(max_length=100)
    hours_per_week = models.IntegerField()
    
    # ML Outputs
    prediction = models.CharField(max_length=10) # <=50K or >50K
    confidence = models.FloatField()
    
    # Business Logic Outputs
    risk_level = models.CharField(max_length=20) # Low, Medium, High
    loan_status = models.CharField(max_length=50) # Approved, Review Required, Rejected
    loan_amount = models.FloatField()
    
    # Meta
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.ref_id or f"Prediction {self.id}"

class Log(models.Model):
    api_call = models.CharField(max_length=255, db_index=True)
    status = models.CharField(max_length=50)
    response_time = models.FloatField() # in milliseconds
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.api_call} - {self.status}"
