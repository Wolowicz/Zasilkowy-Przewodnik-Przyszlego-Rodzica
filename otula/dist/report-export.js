// Both downloads use the same report that the family has open on this device.
(() => {
  const libraries = new Map();
  const title = 'Raport dla rodziny';

  function loadAsset(file) {
    if (!libraries.has(file)) {
      libraries.set(file, new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './assets/' + file;
        script.onload = resolve;
        script.onerror = () => {
          libraries.delete(file);
          script.remove();
          reject(new Error('Nie udało się wczytać narzędzia eksportu.'));
        };
        document.head.append(script);
      }));
    }
    return libraries.get(file);
  }

  function readReport() {
    const main = document.querySelector('#main');
    const root = main.querySelector('[data-report-content]') || main;
    if (!root.querySelector('.report-child')) throw new Error('Otwórz podgląd raportu.');

    const blocks = [];
    let childCount = 0;
    for (const node of root.querySelectorAll('h2,h3,h4,p,li,a[href]')) {
      if (node.closest('.no-print,.page-intro,nav,button,form,[hidden]')) continue;
      if (node.matches('a')) {
        if (node.protocol === 'https:') {
          blocks.push({type:'source', text:node.hostname + node.pathname + node.search + node.hash, url:node.href});
        }
        continue;
      }
      const clone = node.cloneNode(true);
      for (const link of clone.querySelectorAll('a,button,svg')) link.remove();
      const content = clone.textContent.trim().replace(/\s+/g, ' ').replace(/\s*·\s*$/, '')
        .replace(/^(?:✓|✔|☐|□)\s*/, '');
      if (!content) continue;

      if (node.matches('.report-child > h2')) {
        blocks.push({type:'child', text:content, newPage:childCount++ > 0});
      } else if (node.matches('h2,h3,h4')) {
        blocks.push({type:'heading', text:content});
      } else if (node.matches('li')) {
        const list = node.parentElement;
        const index = [...list.children].indexOf(node);
        blocks.push({type:'step', text:(list.matches('ol') ? (list.start + index) + '. ' : '• ') + content});
      } else {
        blocks.push({type:'body', text:content});
      }
    }
    return blocks;
  }

  async function pdfReport(blocks, dateLabel) {
    await Promise.all([loadAsset('report-jspdf.min.js'), loadAsset('report-fonts.js')]);
    const pdf = new window.jspdf.jsPDF({unit:'pt', format:'a4', compress:true, putOnlyUsedFonts:true});
    for (const [name, font] of Object.entries(window.otulaReportFonts)) {
      pdf.addFileToVFS(name + '.ttf', font);
      pdf.addFont(name + '.ttf', name, 'normal');
    }
    pdf.setProperties({title:title, author:'Otula', subject:'Plan spraw rodziny'});
    pdf.setLanguage('pl-PL');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    const margin = 48, top = 65, bottom = height - 55;
    let y = top;
    function newPage() {
      pdf.addPage();
      y = top;
    }

    const styles = {
      title:   {font:'Serif', size:30, line:35, before:0, after:8},
      child:   {font:'Serif', size:23, line:27, before:13, after:5},
      heading: {font:'Serif', size:16, line:20, before:9, after:3},
      body:    {font:'Sans', size:11, line:15, before:0, after:4},
      step:    {font:'Sans', size:11, line:15, before:0, after:2, inset:10},
      source:  {font:'Sans', size:9, line:13, before:1, after:6, color:'#75465a'}
    };
    for (const block of [{type:'title',text:title}, ...blocks]) {
      const style = styles[block.type];
      const x = margin + (style.inset || 0);
      const isHeading = ['child','heading','title'].includes(block.type);
      pdf.setFont(style.font);
      pdf.setFontSize(style.size);
      pdf.setTextColor(style.color || '#32262c');
      const content = block.type === 'source' ? 'Źródło · ' + block.text : block.text;
      const lines = pdf.splitTextToSize(content, width - margin - x);
      // Keep a heading with the first two lines that follow it.
      if (block.newPage || (isHeading && y + style.before + lines.length * style.line + 30 > bottom)) newPage();
      if (y > top) y += style.before;
      for (const line of lines) {
        if (y + style.line > bottom) newPage();
        pdf.text(line, x, y);
        if (block.url) pdf.link(x, y - style.size, pdf.getTextWidth(line), style.line, {url:block.url});
        y += style.line;
      }
      y += style.after;
    }
    const total = pdf.getNumberOfPages();
    for (let page = 1; page <= total; page++) {
      pdf.setPage(page);
      pdf.setFont('Sans');
      pdf.setFontSize(9);
      pdf.setTextColor('#704b5a');
      pdf.text('OTULA', margin, 31);
      pdf.text(dateLabel, width - margin, 31, {align:'right'});
      pdf.setDrawColor('#e8c9b9');
      pdf.line(margin, 40, width - margin, 40);
      pdf.text('Raport dla rodziny', margin, height - 29);
      pdf.text(page + ' / ' + total, width - margin, height - 29, {align:'right'});
    }
    return pdf.output('blob');
  }

  async function wordReport(blocks, dateLabel) {
    await loadAsset('report-docx.js');
    const {Document, ExternalHyperlink, Footer, HeadingLevel, PageNumber, Packer, Paragraph, TextRun} = window.docx;
    const children = [
      new Paragraph({heading:HeadingLevel.TITLE, text:title}),
      new Paragraph({text:'Otula · ' + dateLabel})
    ];
    for (const block of blocks) {
      if (block.url) {
        const link = new ExternalHyperlink({
          link:block.url,
          children:[new TextRun({text:block.text, color:'75465A', underline:{}, size:19})]
        });
        children.push(new Paragraph({children:[new TextRun({text:'Źródło · ', size:19}), link]}));
        continue;
      }
      const heading = {child:HeadingLevel.HEADING_1, heading:HeadingLevel.HEADING_2}[block.type];
      children.push(new Paragraph({text:block.text, heading, pageBreakBefore:block.newPage,
        indent:block.type === 'step' ? {left:240, hanging:200} : undefined}));
    }
    function headingStyle(size, before) {
      return {run:{font:'Georgia', color:'000000', size, bold:false},
        paragraph:{spacing:{before, after:80}, keepNext:true, keepLines:true}};
    }
    const section = {
      properties:{page:{size:{width:11906, height:16838}, margin:{top:1000, right:1050, bottom:1050, left:1050}}},
      footers:{default:new Footer({children:[new Paragraph({alignment:'right', children:[
        new TextRun({children:['Otula · ', PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], size:18, color:'704B5A'})
      ]})]})},
      children
    };
    const doc = new Document({creator:'Otula', title, sections:[section], styles:{default:{
      document:{run:{font:'Calibri', size:23, color:'32262C', language:{value:'pl-PL'}},
        paragraph:{spacing:{after:90, line:280}, widowControl:true}},
      title:headingStyle(48, 0), heading1:headingStyle(38, 235), heading2:headingStyle(29, 185)
    }}});
    return Packer.toBlob(doc);
  }

  async function exportFamilyReport(format) {
    if (!['pdf','docx'].includes(format)) throw new Error('Nieznany format raportu.');
    const blocks = readReport();
    const day = new Date();
    const label = day.toLocaleDateString('pl-PL', {day:'numeric', month:'long', year:'numeric'});
    const blob = format === 'pdf' ? await pdfReport(blocks, label) : await wordReport(blocks, label);
    const date = [day.getFullYear(), day.getMonth()+1, day.getDate()].map(n=>String(n).padStart(2,'0')).join('-');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Otula-raport-rodziny-' + date + '.' + format;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  window.exportFamilyReport = exportFamilyReport;
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-export-report]');
    if (!button || button.disabled) return;
    button.disabled = true;
    try {
      await exportFamilyReport(button.dataset.exportReport);
      announce('Raport jest gotowy do pobrania.');
    } catch {
      announce('Nie udało się przygotować pliku. Spróbuj ponownie lub wybierz drukowanie.');
    } finally {
      button.disabled = false;
    }
  });
})();
