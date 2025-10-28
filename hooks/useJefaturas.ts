import { useState, useEffect } from "react";
import { getJefaturas } from "../lib/services/jefaturaService";
import { Jefatura } from "../types/jefatura";

export const useJefaturas = () => {
    const [jefaturas, setJefaturas] = useState<Jefatura[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJefaturas = async () => {
            try {
                console.log("Iniciando fetch de jefaturas...");
                const data = await getJefaturas();
                console.log("Jefaturas recibidas:", data);
                setJefaturas(data);
            } catch (err) {
                console.error("Error al obtener jefaturas:", err);
                setError(err instanceof Error ? err.message : "Error desconocido");
            } finally {
                setLoading(false);
            }
        };
        fetchJefaturas();
    }, []);

    return { jefaturas, loading, error };
};