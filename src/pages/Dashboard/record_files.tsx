import { useEffect, useState, useMemo, useCallback } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,

} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Download, RefreshCw } from "lucide-react";
import api from "../../api/apiConfig";
import type { AntennaRecord } from "./Components/records/types";


export default function HistorialREI() {
    const [data, setData] = useState<AntennaRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    <a href={row.original.pdf_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-xs font-medium border border-red-200">
                        <FileText size={14} /> PDF
                    </a>
                    <a href={row.original.excel_url} download
                        className="flex items-center gap-1 p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition text-xs font-medium border border-green-200">
                        <Download size={14} /> EXCEL
                    </a>
                </div>
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
                    <h1 className="text-2xl font-bold text-slate-800">Historial de Antenas</h1>
                    <p className="text-slate-500 text-sm">Registros REI sincronizados con la base de datos.</p>
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
        </div>
    );
}