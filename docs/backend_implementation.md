承知しました。設計書に基づき、セキュリティを重視したバックエンドAPIを完全実装いたします。FastAPIを選択し、完全なバリデーション、エラーハンドリング、セキュリティ対策を実装します。

=== requirements.txt ===
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-decouple==3.8
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
pydantic[email]==2.5.0
pydantic-settings==2.1.0
redis==5.0.1
celery==5.3.4
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
faker==20.1.0
coverage==7.3.2
black==23.11.0
isort==5.12.0
flake8==6.1.0
mypy==1.7.1
bandit==1.7.5
safety==2.3.5
pre-commit==3.6.0
slowapi==0.1.9
email-validator==2.1.0
cryptography==41.0.8
bcrypt==4.1.2
```

=== .env.example ===
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/todoapp
DATABASE_TEST_URL=postgresql://username:password@localhost:5432/todoapp_test

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_TEST_URL=redis://localhost:6379/1

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Security Configuration
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
ALLOWED_HEADERS=*

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=10

# Application Configuration
APP_NAME=Todo API
APP_VERSION=1.0.0
APP_DESCRIPTION=Secure Todo Application API
DEBUG=False
ENVIRONMENT=development

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@todoapp.com

# Monitoring Configuration
SENTRY_DSN=your-sentry-dsn-here
LOG_LEVEL=INFO

# File Upload Configuration
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# API Documentation
DOCS_URL=/docs
REDOC_URL=/redoc
OPENAPI_URL=/openapi.json
```

=== app/__init__.py ===
```python
"""
Todo Application API Package
"""

__version__ = "1.0.0"
__author__ = "Todo App Team"
__email__ = "team@todoapp.com"
```

=== app/main.py ===
```python
"""
FastAPI Application Main Module
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine, get_db
from app.core.exceptions import (
    CustomHTTPException,
    ValidationException,
    custom_http_exception_handler,
    validation_exception_handler,
)
from app.core.logging import setup_logging
from app.core.security import SecurityHeaders
from app.models.base import Base

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan events"""
    # Startup
    logger.info("Starting up Todo API...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables created successfully")
    logger.info("Todo API startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Todo API...")
    await engine.dispose()
    logger.info("Todo API shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url=settings.DOCS_URL if settings.DEBUG else None,
    redoc_url=settings.REDOC_URL if settings.DEBUG else None,
    openapi_url=settings.OPENAPI_URL if settings.DEBUG else None,
    lifespan=lifespan,
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add security headers middleware
app.add_middleware(SecurityHeaders)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
    expose_headers=["X-Total-Count", "X-Rate-Limit-Remaining"],
)

# Add trusted host middleware
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add process time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request: {request.method} {request.url.path} "
        f"from {request.client.host if request.client else 'unknown'}"
    )
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(
        f"Response: {response.status_code} "
        f"in {process_time:.4f}s"
    )
    
    return response


# Add custom exception handlers
app.add_exception_handler(CustomHTTPException, custom_http_exception_handler)
app.add_exception_handler(ValidationException, validation_exception_handler)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Todo API is running",
        "version": settings.APP_VERSION,
        "docs": f"{settings.DOCS_URL}" if settings.DEBUG else "Documentation disabled in production",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        async with get_db() as db:
            await db.execute("SELECT 1")
        
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "timestamp": time.time(),
                "error": "Database connection failed",
            }
        )


# Include API router
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
```

=== app/core/config.py ===
```python
"""
Application Configuration
"""

import secrets
from typing import List, Optional

from pydantic import AnyHttpUrl, EmailStr, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Todo API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Secure Todo Application API"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str
    DATABASE_TEST_URL: Optional[str] = None
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_TEST_URL: str = "redis://localhost:6379/1"
    
    # JWT
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Security
    BCRYPT_ROUNDS: int = 12
    PASSWORD_MIN_LENGTH: int = 8
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    ALLOWED_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    ALLOWED_HEADERS: List[str] = ["*"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 10
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[EmailStr] = None
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"
    
    # File Upload
    MAX_FILE_SIZE_MB: int = 5
    ALLOWED_FILE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif"]
    
    # API Documentation
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    OPENAPI_URL: str = "/openapi.json"
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("ALLOWED_METHODS", pre=True)
    def assemble_cors_methods(cls, v: str | List[str]) -> List[str]:
        """Parse CORS methods"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("ALLOWED_HEADERS", pre=True)
    def assemble_cors_headers(cls, v: str | List[str]) -> List[str]:
        """Parse CORS headers"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("ALLOWED_HOSTS", pre=True)
    def assemble_allowed_hosts(cls, v: str | List[str]) -> List[str]:
        """Parse allowed hosts"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("ALLOWED_FILE_TYPES", pre=True)
    def assemble_file_types(cls, v: str | List[str]) -> List[str]:
        """Parse allowed file types"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
```

=== app/core/database.py ===
```python
"""
Database Configuration and Connection Management
"""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    poolclass=NullPool if "sqlite" in settings.DATABASE_URL else None,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=20,
    max_overflow=0,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Database dependency for FastAPI
    
    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables"""
    from app.models.base import Base
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables created successfully")


async def close_db() -> None:
    """Close database connections"""
    await engine.dispose()
    logger.info("Database connections closed")
```

=== app/core/security.py ===
```python
"""
Security Utilities and Middleware
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

import bcrypt
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.config import settings

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer
security = HTTPBearer(auto_error=False)


class SecurityHeaders(BaseHTTPMiddleware):
    """Security headers middleware"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password
        
    Returns:
        bool: True if password matches
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
    """
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password hashing failed"
        )


def validate_password_strength(password: str) -> bool:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        bool: True if password is strong enough
    """
    if len(password) < settings.PASSWORD_MIN_LENGTH:
        return False
    
    # Check for at least one uppercase, lowercase, digit, and special character
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    return all([has_upper, has_lower, has_digit, has_special])


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    
    Args:
        data: Token payload data
        expires_delta: Token expiration time
        
    Returns:
        str: JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    
    try:
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        logger.error(f"Token creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token creation failed"
        )


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create JWT refresh token
    
    Args:
        data: Token payload data
        
    Returns:
        str: JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    
    try:
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        logger.error(f"Refresh token creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Refresh token creation failed"
        )


def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """
    Verify and decode JWT token
    
    Args:
        token: JWT token to verify
        token_type: Expected token type (access/refresh)
        
    Returns:
        Dict[str, Any]: Token payload
        
    Raises:
        HTTPException: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Verify token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {token_type}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check expiration
        exp = payload.get("exp")
        if exp is None or datetime.utcnow() > datetime.fromtimestamp(exp):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return payload
        
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token verification failed"
        )


def generate_secure_token(length: int = 32) -> str:
    """
    Generate a secure random token
    
    Args:
        length: Token length
        
    Returns:
        str: Secure random token
    """
    import secrets
    return secrets.token_urlsafe(length)


def hash_api_key(api_key: str) -> str:
    """
    Hash API key for storage
    
    Args:
        api_key: API key to hash
        
    Returns:
        str: Hashed API key
    """
    return bcrypt.hashpw(api_key.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_api_key(api_key: str, hashed_key: str) -> bool:
    """
    Verify API key against hash
    
    Args:
        api_key: Plain API key
        hashed_key: Hashed API key
        
    Returns:
        bool: True if API key matches
    """
    try:
        return bcrypt.checkpw(api_key.encode('utf-8'), hashed_key.encode('utf-8'))
    except Exception as e:
        logger.error(f"API key verification error: {e}")
        return False
```

=== app/core/exceptions.py ===
```python
"""
Custom Exception Classes and Handlers
"""

import logging
from typing import Any, Dict, Optional

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError

logger = logging.getLogger(__name__)


class CustomHTTPException(HTTPException):
    """Custom HTTP Exception with additional context"""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code
        self.context = context or {}


class ValidationException(Exception):
    """Custom validation exception"""
    
    def __init__(self, message: str, field: Optional[str] = None, context: Optional[Dict[str, Any]] = None):
        self.message = message
        self.field = field
        self.context = context or {}
        super().__init__(self.message)


class AuthenticationException(CustomHTTPException):
    """Authentication related exceptions"""
    
    def __init__(self, detail: str = "Authentication failed", error_code: str = "AUTH_FAILED"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
            error_code=error_code,
        )


class AuthorizationException(CustomHTTPException):
    """Authorization related exceptions"""
    
    def __init__(self, detail: str = "Access denied", error_code: str = "ACCESS_DENIED"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code=error_code,
        )


class NotFoundException(CustomHTTPException):
    """Resource not found exceptions"""
    
    def __init__(self, detail: str = "Resource not found", error_code: str = "NOT_FOUND"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code=error_code,
        )


class ConflictException(CustomHTTPException):
    """Resource conflict exceptions"""
    
    def __init__(self, detail: str = "Resource conflict", error_code: str = "CONFLICT"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code=error_code,
        )


class RateLimitException(CustomHTTPException):
    """Rate limit exceeded exceptions"""
    
    def __init__(self, detail: str = "Rate limit exceeded", error_code: str = "RATE_LIMIT_EXCEEDED"):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            error_code=error_code,
        )


class DatabaseException(CustomHTTPException):
    """Database related exceptions"""
    
    def __init__(self, detail: str = "Database error", error_code: str = "DATABASE_ERROR"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            error_code=error_code,
        )


class ExternalServiceException(CustomHTTPException):
    """External service related exceptions"""
    
    def __init__(self, detail: str = "External service error", error_code: str = "EXTERNAL_SERVICE_ERROR"):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail,
            error_code=error_code,
        )


async def custom_http_exception_handler(request: Request, exc: CustomHTTPException) -> JSONResponse:
    """
    Custom HTTP exception handler
    
    Args:
        request: FastAPI request object
        exc: Custom HTTP exception
        
    Returns:
        JSONResponse: Error response
    """
    logger.error(
        f"Custom HTTP Exception: {exc.status_code} - {exc.detail} "
        f"- Path: {request.url.path} - Method: {request.method}"
    )
    
    error_response = {
        "success": False,
        "error": {
            "code": exc.error_code or "HTTP_ERROR",
            "message": exc.detail,
            "status_code": exc.status_code,
        },
        "timestamp": str(datetime.utcnow().isoformat()),
        "path": str(request.url.path),
        "method": request.method,
    }
    
    # Add context if available
    if exc.context:
        error_response["error"]["context"] = exc.context
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response,
        headers=exc.headers,
    )


async def validation_exception_handler(request: Request, exc: ValidationException) -> JSONResponse:
    """
    Validation exception handler
    
    Args:
        request: FastAPI request object
        exc: Validation exception
        
    Returns:
        JSONResponse: Error response
    """
    logger.warning(
        f"Validation Exception: {exc.message} "
        f"- Field: {exc.field} - Path: {request.url.path}"
    )
    
    error_response = {
        "success": False,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": exc.message,
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
        },
        "timestamp": str(datetime.utcnow().isoformat()),
        "path": str(request.url.path),
        "method": request.method,
    }
    
    # Add field if available
    if exc.field:
        error_response["error"]["field"] = exc.field
    
    # Add context if available
    if exc.context:
        error_response["error"]["context"] = exc.context
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response,
    )


async def pydantic_validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """
    Pydantic validation exception handler
    
    Args:
        request: FastAPI request object
        exc: Pydantic validation error
        
    Returns:
        JSONResponse: Error response
    """
    logger.warning(f"Pydantic Validation Error: {exc} - Path: {request.url.path}")
    
    # Format validation errors
    errors = []
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"])
        errors.append({
            "field": field_path,
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input"),
        })
    
    error_response = {
        "success": False,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Validation failed",
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "details": errors,
        },
        "timestamp": str(datetime.utcnow().isoformat()),
        "path": str(request.url.path),
        "method": request.method,
    }
    
    return JSONResponse(
        status