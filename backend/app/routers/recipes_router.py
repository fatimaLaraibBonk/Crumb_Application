# this is the router for the "look for recipes"
# main goal here is to find trending/new gluten free recipes 

# features
# look for gluten free recipes (scroll)
# save gluten free recipes 

# the recipe data will be fetched using an API 

from fastapi import APIRouter
from app.controllers import recipes_controller

router=APIRouter(prefix="/recipes", tags=["recipes"])

# find new recipes/recipes page 
@router.get("/")
async def recipes_page():
    return recipes_controller.view_recipes()

# save recipes


# view saved recipes 


# view a recipe from saved recipes 


# remove a recipe from saved recipes


# favourite a saved recipe 


