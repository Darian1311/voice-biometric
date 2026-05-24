from fastapi import APIRouter, HTTPException, Depends
from app.routes.api_key import verify_api_key
from tools.db_manager import list_profiles, delete_profile

router = APIRouter(prefix="/registry", tags=["registry"], dependencies=[Depends(verify_api_key)])


@router.get("/profiles")
def get_profiles():
    profiles = list_profiles()
    return {"profiles": profiles, "count": len(profiles)}


@router.delete("/{name}")
def remove_profile(name: str):
    deleted = delete_profile(name)
    if not deleted:
        raise HTTPException(404, f"Profil '{name}' negăsit")
    return {"status": "deleted", "name": name}
