#auth middleware

#libraries
from fastapi import FastAPI,Response, HTTPException, Depends, Cookie
from fastapi.responses import JSOMResponse
from supabase import create_client, Client 
import os
import bcrypt

url: str=os.environ.get("SUPABASE_URL")
key: str=os.environ.get("SUPABASE_SECRET_KEY")
supabase: Client=create_client(url, key)

def validate_user(payload:dict, response: Response):
    email=payload.get("email")
    password=payload.get("password").encode('utf-8')
    #validating credentials
    try:
        response=(
            supabase.table("users")
            .select("user_id, password_hash")
            .eq("email", email)
            .execute()
        )
    except:
        raise Exception("Error occured")
    else:
        if response.data:
            user=response.data[0]
            if bcrypt.checkpw(password, user["password_hash"]):
                print("Login successful!")
                return user["user_id"]
            else:
                print("Incorrect password")
        else:
            print("User not found")
    return None