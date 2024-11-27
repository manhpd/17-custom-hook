import { useEffect, useState } from "react";

interface UseFetchState<T> {
    data: T | null;
    isFetching: boolean;
    error: Error | null;
    setData: React.Dispatch<React.SetStateAction<T>>;
}


export default function useFetch<T>(fetchFn: () => Promise<T>, initValue: T): UseFetchState<T> {
    const [data, setData] = useState<T>(initValue);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsFetching(true);
            try {
                const data = await fetchFn();
                setData(data);
            } catch (error: Error | any) {
                setError(error);
            } finally {
                setIsFetching(false);
            }
        }
        fetchData();
    }, [fetchFn]);

    return { data, isFetching, error, setData };
}