#auth controller

#libraries
from app.validators.auth_validator import LoginSchema, UserSignUp, VerifyEmailSchema, ForgotPasswordSchema, ResetPassword
import os
import bcrypt
from app.config.supabase import supabase
from dotenv import load_dotenv
from email.message import EmailMessage
import smtplib
import ssl
import secrets 
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
#envelope

def _envelope(success: bool, message: str, data=None, detail=None):
    body = {"success": success, "message": message}
    if success:
        body["data"]=data
    else:
        body["detail"]=detail
    return body

#login 
def login_user(payload:LoginSchema):
    email=payload.email
    password=payload.password.encode('utf-8')
    #validating credentials
    try:
        response=(
            supabase.table("users")
            .select("user_id, password_hash")
            .eq("email", email)
            .execute()
        )
    except Exception as e:
        print(f"An error occured: {e}")
        raise HTTPException(status_code=500,detail="Could not process login request.")
    else:
        if response.data:
            user=response.data[0]
            if bcrypt.checkpw(password, user["password_hash"].encode('utf-8')):
                print("Login successful!")
                return user["user_id"]
            else:
                print("Incorrect password")
                raise HTTPException(status_code=401,detail="Incorrect email or password.")
        else:
            print("User not found")
            raise HTTPException(status_code=401,detail="Incorrect email or password.")

#sign up + email verfication 
#steps of sign-up/registeration 
#user fills sign up form 
#clicks on verify me
#verification code is created and sent 
#user enters verification code 
#if correct -> account is created
#else user is taken back to sign up 

def signup_user(payload: UserSignUp):
    email=payload.email
    #additional check that the user already doesnt exist in the users table 
    try:
        response=(
            supabase.table("users")
            .select("user_id")
            .eq("email", email)
            .execute()
        )
        if response.data:
            print("User already exists uner this email!")
            raise HTTPException(status_code=409,detail="User already exists under this email.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"An error has occured {e}")
        raise HTTPException(status_code=500,detail="Could not check if user already exists.")
    #if correct verification was entered then we put user into our database 
    return send_verification_code(payload) #email sent 
    #now we ask user to enter the verification code 



def verify_email(payload: VerifyEmailSchema):
    email=payload.email
    verification_code=payload.verification_code
    #check against the actual storage in the database 
    #if correct
    #if incorrect
    #if expired 
    try:
        response=(
            supabase.table("pending_verifications")
            .select("verification_code, expires_at")
            .eq("email", email)
            .execute()
        )
        #if expired 
        if not response.data:
            raise HTTPException(status_code=404,detail="No verification code found for this email.")
        data=response.data[0]
        expires_at=datetime.fromisoformat(data["expires_at"])
        if expires_at<datetime.now(timezone.utc):
            raise HTTPException(status_code=400,detail="This verification code has expired!")
        elif str(data["verification_code"]) != str(verification_code):
            raise HTTPException(status_code=400,detail="Wrong verification code!")
        else:
            print("Correct verification code!")
            #here is where we create the user
            dob=payload.dob
            username=payload.username
            password=payload.password.encode('utf-8')
            salt=bcrypt.gensalt()
            password_hash=bcrypt.hashpw(password, salt).decode('utf-8')
            try:
                supabase.table("users").insert({
                    "email": email,
                    "password_hash": password_hash,
                    "username": username,
                    "dob": dob.isoformat()
                }).execute()
                #if executed successfully remove entry from pending verifications 
                supabase.table("pending_verifications").delete().eq("email",email).execute()
            except Exception as e:
                print(f"An error as occured {e}")
                raise HTTPException(status_code=500,detail="Could not create user.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"An error has occured {e}")
        raise HTTPException(status_code=500,detail="Could not verify email.")

def send_verification_code (payload: UserSignUp):
    email=payload.email
    username=payload.username
    load_dotenv()
    SENDER_EMAIL=os.environ.get("SENDER_EMAIL")
    APP_PASSWORD=os.environ.get("APP_PASSWORD")
    RECEIVER_EMAIL=email 
    verification_code=f"{secrets.randbelow(1000000):06d}"
    #building email message 
    msg=EmailMessage()
    msg["Subject"]="Veriy your email for Crumb"
    msg.set_content(f"Thank you for signing up to Crumb, {username}! Your verfication code is {verification_code}")
    msg["From"]=SENDER_EMAIL
    msg["To"]=RECEIVER_EMAIL

    #we also need to store the verification code in the database against that user email 
    try:
        response=(
            supabase.table("pending_verifications")
            .select("pending_id")
            .eq("email", email)
            .execute()
        )
    except Exception as e:
        print({f"An error has occured {e}"})
        raise HTTPException(status_code=500,detail="Verification code could not be stored.")
    else:
        try:
            if response.data:
                user=response.data[0]
                print("A verification code already exists for this email, and it needs to be overwritten.")
                supabase.table("pending_verifications").upsert({
                    "email": email,
                    "verification_code": verification_code,
                    "expires_at": (datetime.now(timezone.utc)+timedelta(minutes=5)).isoformat()
                }, on_conflict="email").execute()
            else:
                print("No verification code exists for this email yet.")
                supabase.table("pending_verifications").upsert({
                    "email": email,
                    "verification_code": verification_code,
                    "expires_at": (datetime.now(timezone.utc)+timedelta(minutes=5)).isoformat()
                }).execute()
        except Exception as e:
            print(f"An error has occured {e}")
            raise HTTPException(status_code=500,detail="Verification code could not be stored.")

    #if no entry for that email 
    #if previous enteries for that email exist, then we overwrite the verification code and time 


    #sending email  
    context=ssl.create_default_context()

    #securely connect and send 
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.send_message(msg)
        print("Email sent successfully!")
        return {
            "success": True, 
            "message": "Verification code sent to user."
        }
    except Exception as e:
        print(f"An error occured: {e}")
        raise HTTPException(status_code=500,detail="Verification code could not be sent.")

#forgot + reset password
#when a user wants to change their password (when they forgot it)
#they will be sent a verification code to their email, only when they enter the corre

#forgot + reset password

def forgot_password(payload: ForgotPasswordSchema):
    email=payload.email
    #check if user exists
    try:
        response=(
            supabase.table("users")
            .select("user_id")
            .eq("email", email)
            .execute()
        )
    except Exception as e:
        print(f"An error has occured {e}")
        raise HTTPException(status_code=500,detail="Could not process password reset request.")
    if not response.data:
        raise HTTPException(status_code=404,detail="No account exists under this email.")

    reset_code=f"{secrets.randbelow(1000000):06d}"

    #store/reset verification code
    try:
        supabase.table("password_resets").upsert({
            "email": email,
            "reset_code": reset_code
        }).execute()
    except Exception as e:
        print(f"An error has occured {e}")
        raise HTTPException(status_code=500,detail="Password reset code could not be stored.")

    #send email
    load_dotenv()
    SENDER_EMAIL=os.environ.get("SENDER_EMAIL")
    APP_PASSWORD=os.environ.get("APP_PASSWORD")

    msg=EmailMessage()
    msg["Subject"]="Reset your Crumb password"
    msg.set_content(f"Your Crumb password reset code is {reset_code}. This code expires in 5 minutes.")
    msg["From"]=SENDER_EMAIL
    msg["To"]=email

    context=ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.send_message(msg)
        print("Password reset email sent successfully!")
        return {
            "success": True,
            "message": "Password reset code sent to your email."
        }
    except Exception as e:
        print(f"An error has occured: {e}")
        raise HTTPException(status_code=500,detail="Password reset email could not be sent.")


def reset_password(payload: ResetPassword):
    email=payload.email
    new_password=payload.new_password

    #hash new password
    password_hash=bcrypt.hashpw(new_password.encode("utf-8"),bcrypt.gensalt()).decode("utf-8")

    try:
        response=supabase.table("users").update({
            "password_hash": password_hash
        }).eq("email",email).execute()

        if not response.data:
            raise HTTPException(status_code=404,detail="No account exists under this email.")

        supabase.table("password_resets").delete().eq("email",email).execute()

        return {
            "success": True,
            "message": "Password successfully reset."
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"An error has occured {e}")
        raise HTTPException(status_code=500,detail="Password could not be reset.")