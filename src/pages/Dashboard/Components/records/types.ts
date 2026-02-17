// src/components/records/types.ts
export type AntennaRecord = {
    id: number;
    excel_id: number;
    pdf_id: number;
    pdf_url: string;
    excel_url: string;
    total_antennas: number;
    antennas: any[]; // Aquí va el array parseado del JSON
    createdAt: string;
};