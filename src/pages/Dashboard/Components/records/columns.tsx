import type { ColumnDef } from "@tanstack/react-table";
import type { AntennaRecord } from "./types";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "../../../../components/ui/button";

export const columns: ColumnDef<AntennaRecord>[] = [
    {
        accessorKey: "id",
        header: "ID Registro",
    },
    {
        accessorKey: "total_antennas",
        header: "Total Antenas",
        cell: ({ row }) => (
            <div className="text-center font-medium">
                {row.getValue("total_antennas")}
            </div>
        ),
    },
    {
        id: "documentos",
        header: "Documentos Originales",
        cell: ({ row }) => {
            const { pdf_url, excel_url } = row.original;

            return (
                <div className="flex items-center gap-2">
                    {/* Enlace al PDF */}
                    <Button variant="outline" size="sm" asChild className="text-red-600 border-red-200 hover:bg-red-50">
                        <a href={pdf_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" />
                            PDF
                        </a>
                    </Button>

                    {/* Enlace al Excel */}
                    <Button variant="outline" size="sm" asChild className="text-green-600 border-green-200 hover:bg-green-50">
                        <a href={excel_url} download>
                            <Download className="mr-2 h-4 w-4" />
                            Excel
                        </a>
                    </Button>
                </div>
            );
        },
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
            <Button variant="ghost" size="sm" onClick={() => console.log("Ver detalle:", row.original)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Detalles
            </Button>
        ),
    },
];