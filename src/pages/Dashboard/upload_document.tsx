import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { CloudUpload, FileUp, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import api from "../../api/apiConfig";
import * as pdfjsLib from 'pdfjs-dist';

// Configuración del Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PdfPage = ({ pageNum, pdf }: { pageNum: number, pdf: any }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const renderPage = async () => {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = canvasRef.current;
            if (!canvas) return;

            const context = canvas.getContext('2d');
            if (!context) return;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
        };
        renderPage();
    }, [pageNum, pdf]);

    return (
        <div
            id={`page-container-${pageNum}`}
            className="mb-6 flex flex-col items-center bg-white shadow-md rounded-lg p-4 border border-gray-200"
        >
            <span className="text-[10px] text-gray-400 mb-2 uppercase font-bold tracking-widest">Página {pageNum}</span>
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-sm shadow-sm" />
        </div>
    );
};

export default function UploadDocument() {
    const [antenas, setAntenas] = useState<any[]>([]);
    const [selectedAntena, setSelectedAntena] = useState<any>(null);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pagesWithResults, setPagesWithResults] = useState<number[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [isSearching, setIsSearching] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const targetColumns = [
        '#', 'Cara', 'Acción', 'Operador', 'Tipo de Antena', 'Fabricante', 'MODELO', 'No.',
        'Az', 'Altura instalado (m)', 'Alto (m)', 'Ancho (m)', 'Fondo (m)', 'Mastil',
        'Tipo de Linea', 'Tamaño de línea'
    ];

    // --- LÓGICA DE BÚSQUEDA Y SCROLL ACTUALIZADA ---

    const handleAntennaSearch = async (selectedId: string) => {
        if (!selectedId || !pdfDoc) return;

        setIsSearching(true);
        const results: number[] = [];
        const searchString = `antena ${selectedId}`.toLowerCase();

        try {
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                // Normalizamos el texto: eliminamos espacios extra y unimos todo
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join("")
                    .toLowerCase()
                    .replace(/\s+/g, '');

                // Buscamos la cadena sin espacios para evitar fallos de formato
                const normalizedSearch = searchString.replace(/\s+/g, '');

                if (pageText.includes(normalizedSearch)) {
                    results.push(i);
                }
            }

            setPagesWithResults(results);
            setCurrentResultIndex(0);

            if (results.length > 0) {
                // Pequeño delay para asegurar que el contenedor está listo
                setTimeout(() => scrollToPage(results[0]), 100);
            } else {
                toast.warning(`No se encontraron coincidencias para la Antena ${selectedId}`);
            }
        } catch (error) {
            toast.error("Error al buscar en el PDF");
        } finally {
            setIsSearching(false);
        }
    };

    const scrollToPage = (pageNum: number) => {
        const container = scrollContainerRef.current;
        const target = document.getElementById(`page-container-${pageNum}`);

        if (container && target) {
            // Calculamos la posición necesaria para que el centro del 'target' 
            // coincida con el centro del 'container'
            const targetRect = target.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // target.offsetTop es la distancia desde el inicio del contenedor
            // Queremos restarle la mitad del espacio sobrante del contenedor
            const scrollTarget =
                target.offsetTop -
                (container.clientHeight / 2) +
                (target.clientHeight / 2);

            container.scrollTo({
                top: scrollTarget,
                behavior: 'smooth'
            });
        }
    };

    const handleNextResult = () => {
        if (pagesWithResults.length <= 1) return;
        setCurrentResultIndex((prevIdx) => {
            const nextIdx = (prevIdx + 1) % pagesWithResults.length;
            scrollToPage(pagesWithResults[nextIdx]);
            return nextIdx;
        });
    };

    const handlePrevResult = () => {
        if (pagesWithResults.length <= 1) return;
        setCurrentResultIndex((prevIdx) => {
            const nextIdx = (prevIdx - 1 + pagesWithResults.length) % pagesWithResults.length;
            scrollToPage(pagesWithResults[nextIdx]);
            return nextIdx;
        });
    };

    // --- CARGA DE ARCHIVOS ---

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file?.type === "application/pdf") {
            setPdfFile(file);
            setPagesWithResults([]);
            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                setPdfDoc(pdf);
                toast.info(`PDF cargado: ${pdf.numPages} páginas.`);
            } catch (error) {
                toast.error("Error al procesar el PDF");
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.endsWith(".xlsx")) return toast.error("Formato inválido");
        setExcelFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const bstr = event.target?.result;
            const workbook = XLSX.read(bstr, { type: "binary" });
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 }) as any[][];
            const headerIndex = data.findIndex(row => row.some(cell => String(cell).toLowerCase().includes('modelo')));

            if (headerIndex !== -1) {
                const headers = data[headerIndex].map(h => String(h || "").trim());
                const uniqueAntenas = new Map();
                for (let i = headerIndex + 1; i < data.length; i++) {
                    const row = data[i];
                    const id = parseInt(row[0]);
                    if (!isNaN(id)) {
                        const obj: any = {};
                        headers.forEach((h, idx) => obj[h] = row[idx] || null);
                        if (!uniqueAntenas.has(id)) uniqueAntenas.set(id, obj);
                    }
                }
                const list = Array.from(uniqueAntenas.values());
                setAntenas(list);
                if (list.length > 0) setSelectedAntena(list[0]);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSaveRegistry = async () => {
        if (!excelFile || !pdfFile || antenas.length === 0) return toast.warn("Faltan archivos");
        setIsSaving(true);
        const loadToast = toast.loading("Guardando registro...");
        try {
            const formDataExcel = new FormData();
            formDataExcel.append("file", excelFile);
            formDataExcel.append("file_name", excelFile.name);
            formDataExcel.append("type_file", "excel");
            const resExcel = await api.post("/file_upload", formDataExcel);

            const formDataPdf = new FormData();
            formDataPdf.append("file", pdfFile);
            formDataPdf.append("file_name", pdfFile.name);
            formDataPdf.append("type_file", "pdf");
            const resPdf = await api.post("/file_upload", formDataPdf);

            const response = await api.post("/create_antenna_registry", {
                id_file_excel: resExcel.data.id_file,
                id_file_pdf: resPdf.data.id_file,
                atenna_data: antenas
            });

            if (response.data.success) {
                toast.update(loadToast, { render: "Guardado correctamente", type: "success", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            toast.update(loadToast, { render: "Error al guardar", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-full w-full gap-x-6 bg-slate-50 p-4 overflow-hidden">
            <ToastContainer position="top-right" theme="colored" />

            {/* Sidebar Detalle: Se ajusta al alto disponible sin scroll externo */}
            <aside className="flex w-[380px] flex-col gap-y-4 shrink-0 h-full overflow-hidden">
                <section className="flex flex-col gap-y-2">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white h-10 shadow-sm">
                        <label className="bg-zinc-900 text-white px-4 flex items-center gap-x-2 cursor-pointer hover:bg-black h-full text-xs font-bold">
                            Excel <FileUp size={14} />
                            <input type="file" className="hidden" accept=".xlsx" onChange={handleFileUpload} />
                        </label>
                        <span className="px-3 text-[11px] text-gray-400 truncate flex-1 font-medium">{excelFile?.name || "Sin archivo..."}</span>
                    </div>
                </section>

                <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
                    <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-sm font-bold text-zinc-800 uppercase">Detalle Antena</h2>
                        <span className="bg-zinc-900 text-white text-[17px] px-2 py-1 rounded-full font-bold">ID: {selectedAntena?.['#'] || '--'}</span>
                    </div>
                    {/* Scroll interno solo para los campos de la antena */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {targetColumns.slice(1).map((col) => (
                            <div key={col} className="group">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{col}</label>
                                <div className="mt-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-zinc-700 font-semibold shadow-inner">
                                    {selectedAntena?.[col] ?? "---"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Visor Principal */}
            <main className="flex-1 flex flex-col gap-y-4 overflow-hidden h-full">
                <header className="flex items-center justify-between gap-x-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm shrink-0">
                    <div className="flex flex-col gap-y-1 w-1/3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9">
                            <label className="bg-zinc-900 text-white px-3 flex items-center gap-x-2 cursor-pointer h-full text-xs font-bold transition-colors">
                                <FileText size={14} /> Adjuntar PDF
                                <input type="file" className="hidden" accept=".pdf" onChange={handlePdfUpload} />
                            </label>
                            <span className="px-3 text-[11px] text-gray-400 truncate flex-1 font-medium">{pdfFile?.name || "Esperando PDF..."}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1 w-1/4">
                        <Select
                            value={selectedAntena ? String(selectedAntena['#']) : ""}
                            onValueChange={(val) => {
                                const found = antenas.find(a => String(a['#']) === val);
                                setSelectedAntena(found);
                                handleAntennaSearch(val);
                            }}
                        >
                            <SelectTrigger className="h-9 border-gray-200 text-xs font-bold">
                                <SelectValue placeholder="Antena..." />
                            </SelectTrigger>
                            <SelectContent>
                                {antenas.map((a, i) => (
                                    <SelectItem key={i} value={String(a['#'])}>Antena {a['#']}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Navegación de Resultados */}
                    {pagesWithResults.length > 0 && (
                        <div className="flex flex-col items-center gap-y-1">
                            <div className="flex items-center gap-x-2 bg-blue-50 border border-blue-100 rounded-lg p-1 px-3 h-9">
                                <button onClick={handlePrevResult} className="text-blue-600 hover:bg-blue-200 p-1 rounded-md transition-colors"><ChevronLeft size={16} /></button>
                                <span className="text-[11px] font-extrabold text-blue-700 min-w-[50px] text-center">{currentResultIndex + 1} / {pagesWithResults.length}</span>
                                <button onClick={handleNextResult} className="text-blue-600 hover:bg-blue-200 p-1 rounded-md transition-colors"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSaveRegistry}
                        disabled={isSaving}
                        className={`flex items-center justify-center gap-x-2 rounded-xl px-6 h-10 text-xs font-bold transition-all shadow-lg ${isSaving ? "bg-gray-200 text-gray-400" : "bg-zinc-900 text-white hover:bg-black active:scale-95"}`}
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><CloudUpload size={16} /> Guardar Registro</>}
                    </button>
                </header>

                {/* Contenedor del PDF con scroll-smooth y centrado */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 bg-zinc-800 rounded-2xl border-2 border-zinc-900/10 overflow-y-auto shadow-inner relative custom-scrollbar p-10 scroll-smooth"
                >
                    {isSearching && (
                        <div className="sticky top-0 z-50 flex justify-center mb-4">
                            <div className="bg-blue-600 text-white shadow-xl px-6 py-2 rounded-full flex items-center gap-x-3 border border-blue-500">
                                <Loader2 className="animate-spin" size={16} />
                                <p className="text-[11px] font-black uppercase tracking-widest">Buscando en páginas...</p>
                            </div>
                        </div>
                    )}

                    {pdfDoc ? (
                        <div className="flex flex-col items-center">
                            {Array.from({ length: pdfDoc.numPages }, (_, i) => {
                                const pageNum = i + 1;
                                const isCurrentResult = pagesWithResults[currentResultIndex] === pageNum;
                                return (
                                    <div
                                        key={pageNum}
                                        className={`transition-all duration-500 ${isCurrentResult ? 'ring-8 ring-blue-500/30 rounded-lg' : ''}`}
                                    >
                                        <PdfPage pageNum={pageNum} pdf={pdfDoc} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                            <FileText size={48} strokeWidth={1} className="opacity-20 mb-4" />
                            <p className="text-xs uppercase font-bold tracking-widest">Cargue un PDF para visualizar</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}