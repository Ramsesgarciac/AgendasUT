import { useState, useEffect } from "react";
import { getAreas } from "../lib/services/areaService";
import { Area } from "../types/area";

export const useAreas = () => {
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAreas = async () => {
        try {
            const data = await getAreas();
            setAreas(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
        };
        fetchAreas();
    }, []);

    return { areas, loading, error };
    };
