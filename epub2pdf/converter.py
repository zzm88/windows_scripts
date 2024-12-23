import ebooklib
from ebooklib import epub
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from bs4 import BeautifulSoup
from PIL import Image
import io
import os
import tempfile
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping
import platform

class EPUBtoPDFConverter:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        self.setup_fonts()
        
    def setup_fonts(self):
        # Register a Chinese font
        if platform.system() == 'Windows':
            # Windows default Chinese font
            font_path = "C:\\Windows\\Fonts\\msyh.ttc"  # Microsoft YaHei
        else:
            # For Linux/Mac, you might need to adjust this path
            font_path = "/System/Library/Fonts/PingFang.ttc"
        
        try:
            pdfmetrics.registerFont(TTFont('Chinese', font_path))
        except:
            # Fallback to Arial Unicode MS if available
            try:
                pdfmetrics.registerFont(TTFont('Chinese', "C:\\Windows\\Fonts\\ARIALUNI.TTF"))
            except:
                print("Warning: No suitable Chinese font found. Text might not display correctly.")
    
    def convert(self, epub_path, pdf_path):
        # Read EPUB file
        book = epub.read_epub(epub_path)
        
        # Create PDF with A4 size (more common in China)
        c = canvas.Canvas(pdf_path, pagesize=A4)
        width, height = A4
        
        # Set font
        c.setFont('Chinese', 10)
        
        # Set initial text position
        text_x = 50
        text_y = height - 50
        line_height = 18  # Increased for better readability
        chars_per_line = 45  # Approximate characters per line for A4
        
        # Process each item in the EPUB
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                # Parse HTML content
                soup = BeautifulSoup(item.get_content(), 'html.parser')
                
                # Extract text, preserving paragraphs
                paragraphs = soup.find_all(['p', 'div'])
                
                for p in paragraphs:
                    text = p.get_text().strip()
                    if not text:
                        continue
                        
                    # Process text by chunks to avoid line overflow
                    while text:
                        if text_y < 50:  # Need new page
                            c.showPage()
                            c.setFont('Chinese', 10)
                            text_y = height - 50
                            
                        # Take a chunk of text that will fit on one line
                        chunk = text[:chars_per_line]
                        text = text[chars_per_line:]
                        
                        # Draw the text
                        try:
                            c.drawString(text_x, text_y, chunk)
                        except:
                            # If drawing fails, try encoding as UTF-8
                            c.drawString(text_x, text_y, chunk.encode('utf-8', 'ignore').decode('utf-8'))
                            
                        text_y -= line_height
                    
                    # Add extra space between paragraphs
                    text_y -= line_height/2
            
            elif item.get_type() == ebooklib.ITEM_IMAGE:
                try:
                    # Save image to temporary file
                    img_path = os.path.join(self.temp_dir, 'temp_img')
                    with open(img_path, 'wb') as f:
                        f.write(item.get_content())
                    
                    # Open and resize image if necessary
                    img = Image.open(img_path)
                    img_width, img_height = img.size
                    
                    # Calculate scaling to fit page
                    scale = min((width - 100) / img_width, (height - 100) / img_height)
                    new_width = img_width * scale
                    new_height = img_height * scale
                    
                    # Add image to PDF
                    if text_y < height/2:  # If less than half page left, start new page
                        c.showPage()
                        c.setFont('Chinese', 10)
                        text_y = height - 50
                    
                    c.drawImage(img_path, 
                              (width - new_width) / 2,
                              text_y - new_height,
                              width=new_width,
                              height=new_height)
                    
                    text_y -= new_height + line_height
                    
                except Exception as e:
                    print(f"Error processing image: {e}")
        
        # Save PDF
        c.save()
        
        # Clean up temporary files
        try:
            for file in os.listdir(self.temp_dir):
                os.remove(os.path.join(self.temp_dir, file))
            os.rmdir(self.temp_dir)
        except:
            pass 