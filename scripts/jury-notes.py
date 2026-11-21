"""Build the complete owner briefing PDF from docs/ROZMOWA-Z-JURY.md.

Run from any directory: python scripts/jury-notes.py
Dependencies: reportlab, fonttools, pypdf. Uses only local source and fonts.
Optional --work-dir stores font intermediates outside the repository.
"""
from __future__ import annotations

import argparse
import html
import re
import tempfile
from pathlib import Path

from fontTools.ttLib import TTFont as FontToolsFont
from fontTools.varLib.instancer import instantiateVariableFont
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/ROZMOWA-Z-JURY.md'
OUTPUT = ROOT / 'docs/Otula-notatki-do-jury.pdf'
INK, BERRY = '#452e35', '#783e51'
PALE, PEACH, ROSE, GOLD = '#fffdfb', '#fbe4d7', '#f4e0e7', '#f8ebc7'
PAGE_W, PAGE_H = A4
MARGIN = 46
WIDTH = PAGE_W - MARGIN * 2


def clean(s: str) -> str:
    return s.translate(str.maketrans({'—': '-', '–': '-', '\u2011': '-', '\u00a0': ' '}))


def inline(s: str) -> str:
    s = html.escape(clean(s))
    s = re.sub(r'`([^`]+)`', r'<font color="#783e51">\1</font>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', s)
    def link(m):
        label, url = m.group(1), html.unescape(m.group(2))
        if not re.match(r'https?://', url):
            url = 'https://github.com/Wolowicz/Zasilkowy-Przewodnik-Przyszlego-Rodzica/blob/main/docs/' + url
        return f'<link href="{html.escape(url, quote=True)}" color="#783e51"><u>{label}</u></link>'
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link, s)


def fonts(work: Path):
    asset = ROOT / 'otula/dist/assets'
    for weight, name in [(400, 'OtulaSans'), (700, 'OtulaSansBold')]:
        face = FontToolsFont(asset / 'dm-sans.ttf')
        if 'fvar' in face:
            axes = {a.axisTag: a.defaultValue for a in face['fvar'].axes}
            axes['wght'] = weight
            face = instantiateVariableFont(face, axes, inplace=False)
        target = work / f'{name}.ttf'
        face.save(target)
        pdfmetrics.registerFont(TTFont(name, str(target)))
    pdfmetrics.registerFontFamily('OtulaSans', normal='OtulaSans', bold='OtulaSansBold', italic='OtulaSans', boldItalic='OtulaSansBold')
    pdfmetrics.registerFont(TTFont('OtulaSerif', str(asset / 'dm-serif-text.ttf')))


BODY = dict(fontName='OtulaSans', fontSize=11.5, leading=16, textColor=colors.HexColor(INK), alignment=TA_LEFT, spaceAfter=8)
STYLES = {
    'body': ParagraphStyle('body', **BODY),
    'cell': ParagraphStyle('cell', **{**BODY, 'fontSize': 11, 'leading': 14.5, 'spaceAfter': 0}),
    'headcell': ParagraphStyle('headcell', **{**BODY, 'fontName': 'OtulaSansBold', 'fontSize': 11, 'leading': 14.5, 'spaceAfter': 0}),
    # Sections always start on a fresh page; keeping a heading with an entire
    # multi-page table would move both and leave a label-only page behind.
    'h1': ParagraphStyle('h1', fontName='OtulaSerif', fontSize=24, leading=28, textColor=colors.HexColor(INK), spaceAfter=18, keepWithNext=False),
    'cover': ParagraphStyle('cover', fontName='OtulaSerif', fontSize=35, leading=41, textColor=colors.HexColor(INK), spaceAfter=20),
    'label': ParagraphStyle('label', fontName='OtulaSansBold', fontSize=11.5, leading=16, textColor=colors.HexColor(BERRY), spaceAfter=12),
    'list': ParagraphStyle('list', **{**BODY, 'leftIndent': 22, 'firstLineIndent': -22, 'spaceAfter': 11}),
}


def p(text: str, kind='body') -> Paragraph:
    return Paragraph(inline(text), STYLES[kind])


class Rule(Flowable):
    def __init__(self, width=WIDTH):
        super().__init__(); self.width = width; self.height = 18
    def draw(self):
        self.canv.setStrokeColor(colors.HexColor(PEACH))
        self.canv.setLineWidth(3)
        self.canv.line(0, 11, self.width, 11)


class NotesDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and getattr(flowable, '_section_key', None):
            key = flowable._section_key
            text = flowable.getPlainText()
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, 0, False)
            self.notify('TOCEntry', (0, text, self.page, key))


def page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor(PALE))
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    if doc.page == 1:
        canvas.setFillColor(colors.HexColor(PEACH))
        canvas.roundRect(24, PAGE_H - 310, PAGE_W - 48, 286, 24, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor(ROSE))
        canvas.circle(PAGE_W - 80, PAGE_H - 90, 28, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor(GOLD))
        canvas.circle(PAGE_W - 126, PAGE_H - 58, 15, fill=1, stroke=0)
    else:
        canvas.setFont('OtulaSansBold', 9)
        canvas.setFillColor(colors.HexColor(BERRY))
        canvas.drawString(MARGIN, PAGE_H - 29, 'OTULA  /  NOTATKI DO ROZMOWY Z ZUS I JURY')
        canvas.setStrokeColor(colors.HexColor(PEACH))
        canvas.line(MARGIN, PAGE_H - 36, PAGE_W - MARGIN, PAGE_H - 36)
    canvas.setFont('OtulaSans', 9)
    canvas.setFillColor(colors.HexColor('#6f6265'))
    canvas.drawString(MARGIN, 25, 'Stan opracowania: 21.11.2026')
    canvas.drawRightString(PAGE_W - MARGIN, 25, str(doc.page))
    canvas.restoreState()


def md_blocks(lines: list[str]):
    result = []; i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line: i += 1; continue
        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                vals = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', c) for c in vals): rows.append(vals)
                i += 1
            n = len(rows[0])
            # Keep comfortable body type; paragraphs wrap and rows split only between records.
            widths = [WIDTH * x for x in ({2: [0.32, 0.68], 3: [0.30, 0.35, 0.35]}.get(n, [1/n]*n))]
            if rows[0][1] == 'Waga': widths = [WIDTH*.29, WIDTH*.12, WIDTH*.59]
            if rows[0][0] == 'Materiał': widths = [WIDTH*.34, WIDTH*.34, WIDTH*.32]
            table = Table([[p(c, 'headcell' if r == 0 else 'cell') for c in cells] for r, cells in enumerate(rows)], colWidths=widths, repeatRows=1, hAlign='LEFT')
            table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor(PEACH)),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#fcf5f7')]),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 9), ('RIGHTPADDING', (0,0), (-1,-1), 9),
                ('TOPPADDING', (0,0), (-1,-1), 9), ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('LINEBELOW', (0,0), (-1,0), .7, colors.HexColor('#d9c3ba')),
                ('LINEBELOW', (0,1), (-1,-1), .35, colors.HexColor('#e9e1dd')),
            ]))
            result.extend([table, Spacer(1, 13)])
            continue
        if re.match(r'^\d+\. ', line):
            result.append(p(line, 'list')); i += 1; continue
        para = [line]; i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith('|') and not re.match(r'^\d+\. ', lines[i].strip()):
            para.append(lines[i].strip()); i += 1
        result.append(p(' '.join(para)))
    return result


def build(work: Path):
    fonts(work)
    raw = SOURCE.read_text(encoding='utf-8')
    chunks = re.split(r'^## (.+)$', raw, flags=re.M)
    intro = chunks[0].splitlines()
    title = intro[0].lstrip('# ')
    sections = list(zip(chunks[1::2], chunks[2::2]))
    story = [Spacer(1, 31), p('OTULA.  /  HACKNATION 2026', 'label'), p(title, 'cover'), Spacer(1, 38)]
    story += md_blocks(intro[1:])
    story += [Spacer(1, 22), Rule(), p('Pełne notatki dla właścicielki projektu', 'label'), p('Wymagania konkursowe, pojęcia, zakres aplikacji, pytania do ZUS i odpowiedzi dla jury. Opracowanie zachowuje ograniczenia, źródłowe strony i wszystkie treści wersji Markdown.'), p('To osobny materiał do przygotowania rozmowy, a nie zgłoszeniowa prezentacja 10 slajdów.'), PageBreak(), p('Spis treści', 'h1')]
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle('toc', fontName='OtulaSans', fontSize=12, leading=18, textColor=colors.HexColor(INK), spaceBefore=12, leftIndent=0, firstLineIndent=0, rightIndent=26)]
    story += [toc, Spacer(1, 28), p('Numery stron przy odwołaniach do regulaminu i briefu dotyczą oryginalnych PDF. Numeracja w stopce dotyczy tego opracowania.')]
    for n, (heading, body) in enumerate(sections, 1):
        story.append(PageBreak())
        story.append(p(f'{n:02d}  /  PRZYGOTOWANIE DO ROZMOWY', 'label'))
        h = p(heading, 'h1'); h._section_key = f'section-{n}'
        story.append(h)
        story += md_blocks(body.splitlines())
    doc = NotesDoc(str(OUTPUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=56, bottomMargin=48, title=clean(title), author='Zespół Otuli', subject='Pełne notatki do rozmowy z ZUS i jury; stan 21.11.2026')
    doc.addPageTemplates(PageTemplate(id='all', frames=[Frame(MARGIN, 48, WIDTH, PAGE_H - 104, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], onPage=page))
    doc.multiBuild(story)
    reader = PdfReader(str(OUTPUT))
    text = '\n'.join(pg.extract_text() or '' for pg in reader.pages)
    def norm(s): return re.sub(r'\s+', '', clean(s)).lower()
    expected=[]
    for line in raw.splitlines():
        line = line.strip()
        if not line or re.fullmatch(r'\|[\s:|\-]+', line): continue
        if line.startswith('|'): values = [x.strip() for x in line.strip('|').split('|')]
        else: values = [re.sub(r'^#+ ', '', line)]
        for val in values:
            val = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', val).replace('**','').replace('`','')
            expected.append(val)
    missing = [x for x in expected if norm(x) not in norm(text)]
    if missing: raise RuntimeError('Missing source text: ' + repr(missing[:5]))
    if '\ufffd' in text or '\u25a0' in text: raise RuntimeError('Possible missing glyph')
    print(f'PDF: {OUTPUT}\nPages: {len(reader.pages)}\nSource fragments preserved: {len(expected)}/{len(expected)}\nBytes: {OUTPUT.stat().st_size}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--work-dir', type=Path)
    args = parser.parse_args()
    if args.work_dir:
        args.work_dir.mkdir(parents=True, exist_ok=True); build(args.work_dir)
    else:
        with tempfile.TemporaryDirectory(prefix='otula-jury-notes-') as directory: build(Path(directory))
