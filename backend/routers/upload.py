import logging
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db, AsyncSessionLocal
from models import StoredImage

router = APIRouter(prefix="/upload", tags=["upload"])
logger = logging.getLogger("backend.upload")

MAX_IMAGE_BYTES = 8 * 1024 * 1024


@router.post("/image")
async def upload_image(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Upload an image to database and return its URL"""
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        content = await file.read()
        if len(content) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="Image is too large")

        image_id = str(uuid.uuid4())
        db_image = StoredImage(
            id=image_id,
            filename=file.filename,
            content_type=file.content_type,
            data=content
        )
        
        db.add(db_image)
        await db.commit()

        return {
            "image_url": f"/upload/image/{image_id}",
            "filename": file.filename,
            "id": image_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=500, detail="Upload failed") from e


@router.get("/image/{image_id}")
async def get_image(image_id: str):
    """Serve image from database"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(StoredImage).where(StoredImage.id == image_id))
        image = result.scalars().first()

        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        return Response(content=image.data, media_type=image.content_type)
