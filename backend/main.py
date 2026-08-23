#main.py for crumb web application 
#we will be using FAST API 

#needed libraries
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn
from app.routers import auth_router
load_dotenv() #stores important things like keys, passwords etc
app=FastAPI(title="Crumb Application")

#cors setup 

origins=["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["Authorization"],
)


#routes needed
app.include_router(auth_router.router)

#authentication (signup/login route)



#error and exception handling
# errors into one "field: message; field: message" string under "detail".
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    parts = []
    for err in exc.errors():
        loc = err.get("loc", [])
        field = ".".join(str(p) for p in loc if p != "body") or "body"
        parts.append(f"{field}: {err.get('msg')}")
    detail = "; ".join(parts)

    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "message": "Validation failed",
            "detail": detail,
        },
    )


# Lets our HTTPException(detail={...}) calls (used in auth_middleware.py)
# pass straight through with their already-shaped body.
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail), "detail": str(exc.detail)},
    )
#error handing needs to be improved 
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc),
        },
    )

@app.get("/")
async def root():
    return {"message": "Crumb API is running!"}

#setup and start 
if __name__ == "__main__":
    port=int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)