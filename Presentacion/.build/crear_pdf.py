from pathlib import Path
import re, html
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
import pypdfium2 as pdfium

root = Path(__file__).resolve().parents[1]
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleCustom',fontName='Helvetica-Bold',fontSize=25,leading=30,textColor=HexColor('#142C35'),spaceAfter=18))
styles.add(ParagraphStyle(name='HeadingCustom',fontName='Helvetica-Bold',fontSize=14,leading=18,textColor=HexColor('#087F70'),spaceBefore=14,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='BodyCustom',fontName='Helvetica',fontSize=10.5,leading=15,spaceAfter=9,splitLongWords=True))
styles.add(ParagraphStyle(name='SourceCustom',parent=styles['BodyCustom'],fontSize=8,leading=11,textColor=HexColor('#52656D')))
def footer(canvas,doc):
    canvas.setFont('Helvetica',8)
    canvas.setFillColor(HexColor('#52656D'))
    canvas.drawString(45,28,'Almacén de Bolsillo · Preparación de la defensa')
    canvas.drawRightString(A4[0]-45,28,str(doc.page))

for stem in ['Guion-de-defensa','Preparacion-y-videos']:
    raw=(root/'Entrega'/f'{stem}.md').read_text(encoding='utf-8-sig')
    raw=re.sub(r'(?m)^(## [^\n]+)\n',r'\1\n\n',raw)
    story=[]
    for block in re.split(r'\n\s*\n',raw):
        block=block.strip()
        if not block or block=='---': continue
        if block.startswith('# '):
            story.append(Paragraph(html.escape(block[2:]),styles['TitleCustom']))
        elif block.startswith('## '):
            story.append(Paragraph(html.escape(block[3:]),styles['HeadingCustom']))
        elif stem=='Guion-de-defensa' and re.match(r'^\d\. ',block):
            lines=block.splitlines()
            story.append(Paragraph(html.escape(lines[0]),styles['HeadingCustom']))
            if len(lines)>1: story.append(Paragraph(html.escape(' '.join(lines[1:])),styles['SourceCustom']))
        else:
            parts=block.splitlines() if block.startswith('- ') or re.match(r'^\d\. ',block) else [block]
            for part in parts:
                style=styles['SourceCustom'] if part.startswith(('Fuentes del proyecto:','Caso de Laura')) else styles['BodyCustom']
                story.append(Paragraph(html.escape(part).replace('\n','<br/>'),style))
    out=root/'Entrega'/f'{stem}.pdf'
    doc=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=45,leftMargin=45,topMargin=45,bottomMargin=48,title='Guion de defensa' if stem.startswith('Guion') else 'Preparación y videos',author='Almacén de Bolsillo')
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    pdf=pdfium.PdfDocument(str(out))
    for i,page in enumerate(pdf):
        page.render(scale=1.3).to_pil().save(root/'.build'/f'{stem}-{i+1}.png')
    print(f'{out}: {len(pdf)} páginas')
