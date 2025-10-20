import { useState, useEffect } from "react";
import { getTipoAreas } from "../lib/services/tipoAreaService";
import { TipoArea } from "../types/tipoArea";

export const useTipoAreas = () => {
    const [tipoAreas, setTipoAreas] = useState<TipoArea[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTipoAreas = async () => {
        try {
            const data = await getTipoAreas();
            setTipoAreas(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
        };
        fetchTipoAreas();
    }, []);

    return { tipoAreas, loading, error };
    };