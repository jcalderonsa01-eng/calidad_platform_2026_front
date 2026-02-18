import { useState, useEffect } from "react";
import { X, ChevronRight, Radio, Info } from "lucide-react";

interface AntennaTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        id_information_antenna: number;
        id_file_excel_cl: number;
        id_file_pdf_cl: number;
        antenna_data: any[];
    };
}

export const AntennaTableModal = ({ isOpen, onClose, data }: AntennaTableModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const antennas = data?.antenna_data || [];

    useEffect(() => {
        if (isOpen) setCurrentIndex(0);
    }, [isOpen]);

    if (!isOpen || antennas.length === 0) return null;

    const currentAntenna = antennas[currentIndex];

    // Configuración de campos en el orden exacto solicitado
    const fields = [
        { label: '#', value: currentIndex + 1 },
        { label: 'Cara / Sector', key: 'cara' },
        { label: 'Estado de la obra', key: 'accion' },
        { label: 'Operador', key: 'operador' },
        { label: 'Tipo de Antena', key: 'tipo_antena' },
        { label: 'Fabricante', key: 'fabricante' },
        { label: 'Modelo', key: 'modelo' },
        { label: 'No.', key: 'id_item' }, // Asumiendo que 'id_item' es el 'No.'
        { label: 'Azimuth (Az)', key: 'az' },
        { label: 'Altura Instalada (m)', key: 'altura_instalada' },
        { label: 'Alto (m)', key: 'alto' },
        { label: 'Ancho (m)', key: 'ancho' },
        { label: 'Fondo (m)', key: 'fondo' },
        { label: 'Mástil', key: 'mastil' },
        { label: 'Tipo de Línea', key: 'tipo_linea' },
        { label: 'Tamaño de línea', key: 'tamano_linea' }
    ];

    const getFieldValue = (field: any) => {
        // Si el campo tiene un valor estático (como el #)
        if (field.value !== undefined) return field.value;

        const val = currentAntenna[field.key];
        if (val === null || val === undefined || val === "") return "---";
        return val;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm p-4 text-slate-800">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-200">
                            <Radio size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ficha Técnica de Antena</h2>
                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">REI ID: {data.id_information_antenna}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Selector de Antena */}
                <div className="px-8 py-5 bg-white border-b">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <Info size={10} /> Seleccionar Antena
                    </label>
                    <select
                        value={currentIndex}
                        onChange={(e) => setCurrentIndex(Number(e.target.value))}
                        className="w-full bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-blue-700 outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all cursor-pointer appearance-none shadow-inner"
                    >
                        {antennas.map((_, idx: number) => (
                            <option key={idx} value={idx}>
                                Antena {idx + 1}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Cuadrícula de Datos (Orden Solicitado) */}
                <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 bg-white max-h-[60vh] overflow-y-auto">
                    {fields.map((field, idx) => (
                        <div key={idx} className="space-y-1 group">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                                {field.label}
                            </label>
                            <div className={`text-sm font-bold p-3 rounded-xl border transition-all flex items-center min-h-[44px] ${field.key === 'accion' && currentAntenna.accion === 'Nuevo' ? 'bg-green-50 text-green-700 border-green-100' :
                                    field.key === 'accion' && currentAntenna.accion === 'No Existent' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'text-slate-700 bg-slate-50 border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30'
                                }`}>
                                {getFieldValue(field)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Navegador */}
                <div className="p-6 bg-slate-50 border-t flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                        Registro {currentIndex + 1} de {antennas.length}
                    </span>

                    <div className="flex gap-3">
                        <button
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                            className="px-6 py-2.5 text-xs font-black uppercase bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={currentIndex === antennas.length - 1}
                            onClick={() => setCurrentIndex(prev => prev + 1)}
                            className="px-6 py-2.5 text-xs font-black uppercase bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-30 flex items-center gap-2 transition-all shadow-lg active:scale-95"
                        >
                            Siguiente <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};