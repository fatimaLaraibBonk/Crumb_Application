
# libraries 

from dotenv import load_dotenv
import os
import requests 
from fastapi import HTTPException

def _envelope(success: bool, message: str, data=None, detail=None):
    body = {"success": success, "message": message}
    if success:
        body["data"]=data
    else:
        body["detail"]=detail
    return body



def view_recipes():
    api=os.environ.get("recipes_api")
    const_query="gluten free"
    const_url=url = "https://api.spoonacular.com/recipes/complexSearch"
    params={
        "query" : const_query,
        "intolerances": "gluten",
        "apiKey": api,
        "number": 5
    }
    response = requests.get(url, params=params)
    try:
        data = response.json()
        return data.get("results", [])
    except Exception as e:
        print(f"An exception {e} has occured")
        raise HTTPException(status_code=500,detail="Could not complete this request.")


