// Odczyt PDF w przeglądarce: najpierw warstwa tekstowa (pdf.js), dla skanów — OCR (Tesseract.js, model „pol”).
// Plik nie opuszcza przeglądarki; do API wysyłany jest wyłącznie odczytany tekst.

export async function readPdf(file, onProgress = () => {}, maxPages = 12) {
  const t0 = performance.now();
  const pdfjs = await import('pdfjs-dist');
  const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = doc.numPages;
  let text = '';
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(' ') + '\n';
    onProgress({ stage: 'text', page: i, pages });
  }
  let method = 'Warstwa tekstowa PDF';
  if (text.replace(/\s/g, '').length < 80) {
    method = 'OCR (Tesseract, język polski)';
    const { createWorker } = await import('tesseract.js');
    const limit = Math.min(pages, maxPages); // skany ZUS mają do ~30 stron; kończymy wcześniej po znalezieniu podstawy
    let current = 1;
    // Jeden worker na cały dokument (model językowy ładowany raz).
    const worker = await createWorker('pol', 1, {
      logger: (m) => m.status === 'recognizing text' && onProgress({ stage: 'ocr', page: current, pages: limit, progress: m.progress }),
    });
    text = '';
    try {
      for (let i = 1; i <= limit; i++) {
        current = i;
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const r = await worker.recognize(canvas);
        text += r.data.text + '\n';
        if (i >= 2 && /podstaw\S*\s+wymiar\S*[^\d]{0,120}\d[\d .]*,\d{2}/i.test(text)) break;
      }
    } finally {
      await worker.terminate();
    }
  }
  return { text, pages, method, ms: Math.round(performance.now() - t0) };
}
