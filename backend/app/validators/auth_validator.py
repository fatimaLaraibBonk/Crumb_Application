#auth (login sign up validator)

from pydantic import BaseModel, EmailStr, field_validator
from datetime import date 

class UserSignUp(BaseModel):
    """
    for POST/auth/signup
    """
    email: EmailStr
    password: str #when the passwords are stored they will be storeed in hash 
    username: str
    dob: date

    #then we can define special checks

    @field_validator("password")
    @classmethod
    def validator_password(cls, v:str)->str:
        v=v.strip()
        if len(v)<8:
            raise ValueError("password must be atleast 8 characters long")
        if len(v)>20:
            raise ValueError("password can not be greater than 20 characters")
        return v

    @field_validator("username")
    @classmethod   
    def validator_username(cls, v:str)->str:
        v=v.strip() 
        if len(v)==0:
            raise ValueError("username must be atleast a character long")
        return v 

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if len(v)<1:
            raise ValueError("email is required")
        return v.strip().lower()

class ResetPassword(BaseModel):
    new_password: str 
    @field_validator("new_password")
    @classmethod
    def validator_password(cls, v:str)->str:
        v=v.strip()
        if len(v)<8:
            raise ValueError("password must be atleast 8 characters long")
        if len(v)>20:
            raise ValueError("password can not be greater than 20 characters")
        return v


class VerifyResetCodeSchema(BaseModel):
    email: EmailStr
    reset_code: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("reset_code")
    @classmethod
    def check_verification_code(cls, v: str)-> str:
        if len(v)!=6:
            raise ValueError("Reset code can only be 6 digits long")
        return v 

class ForgotPasswordSchema(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if len(v)<1:
            raise ValueError("email is required")
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("password is required")
        return v

class VerifyEmailSchema(BaseModel):
   
    verification_code: str
    email: EmailStr
    password: str #when the passwords are stored they will be storeed in hash 
    username: str
    dob: date

    #then we can define special checks

    @field_validator("password")
    @classmethod
    def validator_password(cls, v:str)->str:
        v=v.strip()
        if len(v)<8:
            raise ValueError("password must be atleast 8 characters long")
        if len(v)>20:
            raise ValueError("password can not be greater than 20 characters")
        return v

    @field_validator("username")
    @classmethod   
    def validator_username(cls, v:str)->str:
        v=v.strip() 
        if len(v)==0:
            raise ValueError("username must be atleast a character long")
        return v 

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if len(v)<1:
            raise ValueError("email is required")
        return v.strip().lower()
    
    @field_validator("verification_code")
    @classmethod
    def check_verification_code(cls, v: str)-> str:
        if len(v)!=6:
            raise ValueError("Verfication code can only be 6 digits long")
        return v
    