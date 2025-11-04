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
            const data = await getJefaturas();
            setJefaturas(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
        };
        fetchJefaturas();
    }, []);

    return { jefaturas, loading, error };
    };