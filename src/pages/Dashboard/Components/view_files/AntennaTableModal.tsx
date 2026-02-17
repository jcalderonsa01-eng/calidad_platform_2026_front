import { X } from "lucide-react";

interface AntennaTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    idRei: number | string;
}

export const AntennaTableModal = ({ isOpen, onClose, data, idRei }: AntennaTableModalProps) => {
    if (!isOpen) return null;

    // Columnas que queremos mostrar (las mismas de tu Cargar Documento)
    const columns = [
        '#', 'Cara', 'Acción', 'Operador', 'Tipo de Antena', 'Fabricante', 'MODELO',
        'No.', 'Az', 'Altura instalado (m)', 'Alto (m)', 'Ancho (m)', 'Fondo (m)'
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Detalle de Registro REI #{idRei}</h2>
                        <p className="text-sm text-slate-500">{data.length} antenas registradas</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                {/* Tabla */}
                <div className="flex-1 overflow-auto p-6">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="sticky top-0 bg-zinc-900 text-white shadow-md">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="px-4 py-3 font-bold uppercase tracking-wider border-x border-zinc-800">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                            {data.map((antena, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                    {columns.map(col => (
                                        <td key={col} className="px-4 py-3 text-slate-700 font-medium border-x border-slate-100">
                                            {antena[col] || antena[col.toLowerCase()] || "---"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};