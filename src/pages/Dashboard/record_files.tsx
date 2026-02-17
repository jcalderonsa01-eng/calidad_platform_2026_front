import { useEffect, useState, useMemo, useCallback } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Download, RefreshCw, Eye } from "lucide-react";
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
        link.download = fileName; // Aquí forzamos el nombre y extensión
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Error al descargar el archivo:", error);
    }
};

export default function HistorialREI() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AntennaRecord | null>(null);

    const [data, setData] = useState<AntennaRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleOpenModal = (record: AntennaRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    // 2. Definición de Columnas (Ahora dentro del mismo archivo para mayor claridad)
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
                    {/* PDF - Ahora forzado a descargar si el usuario no quiere solo ver */}
                    <button
                        onClick={() => downloadFile(row.original.pdf_url, `REI_${row.original.id}.pdf`)}
                        className="flex items-center gap-1 p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-xs font-medium border border-red-200"
                    >
                        <FileText size={14} /> PDF
                    </button>

                    {/* EXCEL - Forzando extensión .xlsx */}
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
                <span className="font-semibold">{row.original.createdAt}</span>
            )
        },
        {
            id: "vista_previa",
            header: "Ver REI",
            cell: ({ row }) => (
                <button onClick={() => handleOpenModal(row.original)} >
                    <Eye />
                </button>
            )
        }
    ], []);

    // 3. Configuración de la Tabla
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // 4. Lógica de Petición
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
            <AntennaTableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedRecord?.antennas || []}
                idRei={selectedRecord?.id || ''}
            />
        </div>
    );
}