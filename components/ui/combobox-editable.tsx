import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ComboboxEditableProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ id: string | number; nombre: string }>;
    placeholder?: string;
    emptyMessage?: string;
    className?: string;
}

export function ComboboxEditable({
    value,
    onChange,
    options,
    placeholder = 'Selecciona o escribe...',
    emptyMessage = 'No se encontraron resultados.',
    className,
    }: ComboboxEditableProps) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    // Cerrar el dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setOpen(false);
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sincronizar searchValue con value cuando cambia externamente
    useEffect(() => {
        setSearchValue(value);
    }, [value]);

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setSearchValue(selectedValue);
        setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
        onChange(newValue);
        if (!open) setOpen(true);
    };

    const handleClear = () => {
        onChange('');
        setSearchValue('');
    };

    const filteredOptions = options.filter((option) =>
        option.nombre.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
        <div className="relative">
            <Input
            value={searchValue}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="pr-16 h-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchValue && (
                <button
                type="button"
                className="h-5 w-5 p-0 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                onClick={handleClear}
                >
                <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
            )}
            <button
                type="button"
                className="h-5 w-5 p-0 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                onClick={() => setOpen(!open)}
            >
                <ChevronsUpDown className="h-3.5 w-3.5 text-gray-500 opacity-50" />
            </button>
            </div>
        </div>

        {open && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
                <div className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 text-center">
                {emptyMessage}
                </div>
            ) : (
                <div className="py-1">
                {filteredOptions.map((option) => (
                    <button
                    key={option.id}
                    type="button"
                    className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer transition-colors"
                    onClick={() => handleSelect(option.nombre)}
                    >
                    <Check
                        className={cn(
                        'h-4 w-4 text-primary',
                        value === option.nombre ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                    <span className="flex-1 truncate">{option.nombre}</span>
                    </button>
                ))}
                </div>
            )}
            </div>
        )}
        </div>
    );
}