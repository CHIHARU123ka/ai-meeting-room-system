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