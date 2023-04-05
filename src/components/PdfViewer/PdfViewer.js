import React, { useEffect, useRef, useState } from "react";
import pdfjsLib from "pdfjs-dist";
import pdfjs from "pdfjs-dist";

function PdfViewer({ url }) {
  // const [pdf, setPdf] = useState(null);

  // useEffect(() => {
  //   const loadPdf = async () => {
  //     const loadingTask = pdfjsLib.getDocument({ url: url });
  //     loadingTask.promise
  //       .then((pdf) => {
  //         console.log("PDF cargado");
  //         // aquí puedes hacer lo que necesites con el objeto pdf
  //       })
  //       .catch((reason) => {
  //         console.error("Error al cargar el PDF: " + reason);
  //       });
  //     // const pdf = await loadingTask.promise;
  //     // setPdf(pdf);
  //   };
  //   loadPdf();
  // }, [url]);

  // if (!pdf) {
  //   return <div>Loading...</div>;
  // }

  // const getPage = async (pageNumber) => {
  //   const page = await pdf.getPage(pageNumber);
  //   const viewport = page.getViewport({ scale: 1.0 });
  //   const canvas = document.createElement("canvas");
  //   const canvasContext = canvas.getContext("2d");
  //   canvas.height = viewport.height;
  //   canvas.width = viewport.width;
  //   const renderContext = {
  //     canvasContext,
  //     viewport,
  //   };
  //   await page.render(renderContext).promise;
  //   return canvas.toDataURL();
  // };

  // const totalPages = pdf.numPages;

  // return (
  //   <div>
  //     {Array.from({ length: totalPages }).map((_, index) => (
  //       <img key={index} src={getPage(index + 1)} alt={`Page ${index + 1}`} />
  //     ))}
  //   </div>
  // );

  // const [pdfData, setPdfData] = useState(null);

  // const loadPdf = async () => {
  //   const url = "https://url-del-archivo-pdf.pdf";
  //   const loadingTask = pdfjs.getDocument(url);
  //   const pdf = await loadingTask.promise;
  //   setPdfData(pdf);
  // };

  // return (
  //   <div>
  //     <button onClick={loadPdf}>Cargar PDF</button>
  //     {pdfData && <p>PDF cargado correctamente</p>}
  //   </div>
  // );

  const canvasRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js";
    script.onload = () => {
      loadPdf(url);
    };
    document.body.appendChild(script);
  }, [url]);

  const loadPdf = async (url) => {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
  };

  return <canvas ref={canvasRef} />;
}

export default PdfViewer;
