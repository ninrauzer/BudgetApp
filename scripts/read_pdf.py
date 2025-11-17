#!/usr/bin/env python3
"""
Script para extraer texto de un estado de cuenta en PDF
"""
import PyPDF2
import sys

def extract_pdf_text(pdf_path):
    """Extrae todo el texto de un PDF"""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            
            print(f"📄 PDF: {pdf_path}")
            print(f"📊 Total de páginas: {len(reader.pages)}\n")
            print("=" * 80)
            
            full_text = ""
            for page_num, page in enumerate(reader.pages, 1):
                text = page.extract_text()
                full_text += text
                print(f"\n{'='*80}")
                print(f"PÁGINA {page_num}/{len(reader.pages)}")
                print(f"{'='*80}\n")
                print(text)
            
            return full_text
            
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo {pdf_path}")
        return None
    except Exception as e:
        print(f"❌ Error al leer el PDF: {e}")
        return None

if __name__ == "__main__":
    pdf_path = r"e:\MyFiles\Descargas\00001635-monthlyPdf.pdf"
    
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    
    extract_pdf_text(pdf_path)
