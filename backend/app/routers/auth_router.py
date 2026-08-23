#auth router 

#endpoints/routes this file deals with 
"""
POST /auth/signup
POST /auth/verify-email
POST /auth/login
POST /auth/forgot-password
POST /auth/verify-reset-code
POST /auth/reset-password
"""

#libraries 
from fastapi import APIRouter
from app.controllers import auth_controller
from app.validators.auth_validator import LoginSchema, UserSignUp, VerifyEmailSchema, ForgotPasswordSchema, ResetPassword, VerifyResetCodeSchema

router=APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
async def signup_route(
    payload: UserSignUp
):
    return  auth_controller.signup_user(payload)

@router.post("/verify-email")
async def verify_email_route(payload: VerifyEmailSchema):
    return  auth_controller.verify_email(payload)

@router.post("/login")
async def login_route(payload: LoginSchema):
    return  auth_controller.login_user(payload)

@router.post("/forgot_password")
async def forgot_password(payload: ForgotPasswordSchema):
    return  auth_controller.forgot_password(payload)

@router.post("/verify-reset-code")
async def verify_reset_code_route(payload: VerifyResetCodeSchema):
    return  auth_controller.verify_reset_code(payload)

@router.post("/reset_password")
async def reset_password(payload: ResetPassword):
    return  auth_controller.reset_password(payload)