"""
PDF text extraction utility.
"""
import PyPDF2
from io import BytesIO
from fastapi import UploadFile, HTTPException
import logging

logger = logging.getLogger(__name__)


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract text content from a PDF file.
    
    Args:
        file: PDF file upload from user
        
    Returns:
        str: Extracted text content
        
    Raises:
        HTTPException: If PDF is invalid or text extraction fails
    """
    try:
        # Read file content
        content = await file.read()
        
        # Create PDF reader
        pdf_file = BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Validate PDF
        if len(pdf_reader.pages) == 0:
            raise HTTPException(400, "PDF file is empty")
        
        logger.info(f"Processing PDF with {len(pdf_reader.pages)} pages")
        
        # Extract text from all pages
        text = ""
        for page_num, page in enumerate(pdf_reader.pages):
            page_text = page.extract_text()
            text += page_text + "\n"
            logger.info(f"Extracted {len(page_text)} chars from page {page_num + 1}")
        
        # Validate extracted text
        text = text.strip()
        if not text:
            raise HTTPException(
                400,
                "Could not extract text from PDF. "
                "Please ensure your resume is text-based, not an image."
            )
        
        logger.info(f"Total extracted text: {len(text)} characters")
        return text
        
    except PyPDF2.errors.PdfReadError as e:
        logger.error(f"PDF read error: {e}")
        raise HTTPException(400, "Invalid or corrupted PDF file")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF processing failed: {e}")
        raise HTTPException(500, f"PDF processing failed: {str(e)}")

