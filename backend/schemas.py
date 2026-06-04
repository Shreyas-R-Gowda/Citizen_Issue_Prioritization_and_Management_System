from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from models import UserRole, ReportStatus, ReportSeverity, ReportPriority

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=128)
    role: UserRole = UserRole.citizen

class UserResponse(UserBase):
    id: int
    name: Optional[str] = None
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Department & Team Schemas
class DepartmentResponse(BaseModel):
    id: int
    name: str
    slug: str
    
    class Config:
        from_attributes = True

class FieldTeamResponse(BaseModel):
    id: int
    name: str
    status: str
    current_lat: Optional[float]
    current_lon: Optional[float]
    department_id: int
    
    class Config:
        from_attributes = True

# Report Schemas
class ReportBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    description: str = Field(..., min_length=5, max_length=2000)
    category: str = Field("road_issues", max_length=50)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    image_url: Optional[str] = Field(None, max_length=500)

    @field_validator("category")
    @classmethod
    def normalize_category(cls, value: str) -> str:
        return value.strip().lower()

class ReportCreate(ReportBase):
    pass

class ReportResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    status: ReportStatus
    severity: ReportSeverity
    priority: ReportPriority
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    upvotes: int
    created_at: datetime
    user_id: int
    department_id: Optional[int]
    assigned_team_id: Optional[int]
    resolution_image_url: Optional[str]
    citizen_feedback: Optional[str]
    
    # AI Scores - Pothole Domain
    pothole_spread_score: Optional[float] = None  # YOLO area_ratio (0-1)

    # AI Scores - Common
    emotion_score: Optional[float] = None
    location_score: Optional[float] = None
    upvote_score: Optional[float] = None
    
    # Final AI Severity
    ai_severity_score: Optional[float] = None
    ai_severity_level: Optional[str] = None
    
    # Metadata for explanations
    location_meta: Optional[str] = None
    sentiment_meta: Optional[str] = None
    
    class Config:
        from_attributes = True

class ReportUpdate(BaseModel):
    status: Optional[ReportStatus] = None
    severity: Optional[ReportSeverity] = None
    title: Optional[str] = Field(None, min_length=3, max_length=120)
    description: Optional[str] = Field(None, min_length=5, max_length=2000)
    resolution_image_url: Optional[str] = Field(None, max_length=500)
    citizen_feedback: Optional[str] = Field(None, max_length=1000)
    assigned_team_id: Optional[int] = None
