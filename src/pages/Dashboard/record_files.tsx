import { useEffect, useState, useMemo, useCallback } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Download, RefreshCw, Eye, Loader2 } from "lucide-react";
import api from "../../api/apiConfig";
import type { AntennaRecord } from "./Components/records/types";
import { AntennaTableModal } from "./Components/view_files/AntennaTableModal";

const downloadFile = async (url: string, fileName: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Error al descargar el archivo:", error);
    }
};

export default function HistorialREI() {
    // ESTADOS
    const [data, setData] = useState<AntennaRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para el Modal y Metadata
    const [selectedAntennaData, setSelectedAntennaData] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<number | null>(null); // Para mostrar loader en el ojo específico

    // Función principal para obtener metadata de antenas (Endpoint solicitado)
    const handleViewAntennas = async (idRei: number) => {
        setLoadingId(idRei);
        try {
            // Usamos la instancia de api o fetch directo. 
            // Si usas apiConfig (axios), sería: const response = await api.get(`/get_file_metadata/${idRei}`);
            const response = await api.get('/get_file_metadata/3');
            const result = response.data
            console.log(data)
            if (result.success) {
                setSelectedAntennaData(result.data);
                setIsModalOpen(true);
            } else {
                alert("No se pudo obtener la información de las antenas");
            }
        } catch (error) {
            console.error("Error al obtener metadata:", error);
            alert("Error de conexión al obtener detalles");
        } finally {
            setLoadingId(null);
        }
    };

    // Definición de Columnas
    const columns = useMemo<ColumnDef<AntennaRecord>[]>(() => [
        { accessorKey: "id", header: "ID REI" },
        {
            accessorKey: "total_antennas",
            header: "Cant. Antenas",
            cell: ({ row }) => <span className="font-semibold">{row.original.total_antennas}</span>
        },
        {
            id: "descargas",
            header: "Documentos",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => downloadFile(row.original.pdf_url, `REI_${row.original.id}.pdf`)}
                        className="flex items-center gap-1 p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-xs font-medium border border-red-200"
                    >
                        <FileText size={14} /> PDF
                    </button>

                    <button
                        onClick={() => downloadFile(row.original.excel_url, `REI_${row.original.id}.xlsx`)}
                        className="flex items-center gap-1 p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition text-xs font-medium border border-green-200"
                    >
                        <Download size={14} /> EXCEL
                    </button>
                </div>
            )
        },
        {
            id: "fecha_creacion",
            header: "Fecha de creación",
            cell: ({ row }) => (
                <span className="font-semibold text-slate-500">{row.original.createdAt}</span>
            )
        },
        {
            id: "vista_previa",
            header: "Ver REI",
            cell: ({ row }) => (
                <button
                    onClick={() => handleViewAntennas(row.original.id)}
                    disabled={loadingId !== null}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors disabled:opacity-50"
                >
                    {loadingId === row.original.id ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>
            )
        }
    ], [loadingId]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get("/get_antennas");

            if (response.data?.success) {
                setData(response.data.data);
            } else {
                setError(response.data?.message || "Error en la base de datos");
            }
        } catch (err) {
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="p-8 h-screen flex flex-col bg-slate-50">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Historial de Informes REI</h1>
                </div>
                <button onClick={fetchData} className="p-2 hover:bg-slate-200 rounded-full transition">
                    <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : "text-slate-600"} />
                </button>
            </div>

            <div className="flex-1 bg-white border rounded-xl shadow-sm overflow-auto">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400">Cargando...</div>
                ) : error ? (
                    <div className="h-full flex items-center justify-center text-red-500 italic">{error}</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs sticky top-0 border-b">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 font-semibold">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de Antenas con la data del fetch */}
            {selectedAntennaData && (
                <AntennaTableModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedAntennaData(null);
                    }}
                    data={selectedAntennaData}
                />
            )}
        </div>
    );
}