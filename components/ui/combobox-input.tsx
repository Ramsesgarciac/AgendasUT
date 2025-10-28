    import * as React from "react"
    import { Check, ChevronsUpDown } from "lucide-react"
    import { cn } from "@/lib/utils"
    import { Button } from "@/components/ui/button"
    import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    } from "@/components/ui/command"
    import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    } from "@/components/ui/popover"

    interface ComboboxInputProps {
    value: string
    onValueChange: (value: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
    disabled?: boolean
    emptyMessage?: string
    className?: string
    }

    export function ComboboxInput({
    value,
    onValueChange,
    options,
    placeholder = "Selecciona o escribe...",
    disabled = false,
    emptyMessage = "No se encontraron opciones.",
    className,
    }: ComboboxInputProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState(value)

    // Sincronizar inputValue con value cuando cambia externamente
    React.useEffect(() => {
        setInputValue(value)
    }, [value])

    const handleSelect = (selectedValue: string) => {
        onValueChange(selectedValue)
        setInputValue(selectedValue)
        setOpen(false)
    }

    const handleInputChange = (newValue: string) => {
        setInputValue(newValue)
        onValueChange(newValue)
    }

    // Verificar si el valor actual está en las opciones
    const selectedOption = options.find((option) => option.value === value)
    const displayValue = selectedOption ? selectedOption.label : value

    return (
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
                "w-full justify-between",
                !value && "text-muted-foreground",
                className
            )}
            >
            <span className="truncate">
                {displayValue || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
            <Command>
            <CommandInput
                placeholder="Buscar o escribir..."
                value={inputValue}
                onValueChange={handleInputChange}
            />
            <CommandList>
                <CommandEmpty>
                {inputValue ? (
                    <div className="p-2 text-sm">
                    <p className="text-muted-foreground mb-2">{emptyMessage}</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                        handleSelect(inputValue)
                        }}
                    >
                        Usar "{inputValue}"
                    </Button>
                    </div>
                ) : (
                    <p className="p-2 text-sm text-muted-foreground">{emptyMessage}</p>
                )}
                </CommandEmpty>
                <CommandGroup>
                {options.map((option) => (
                    <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {option.label}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
            </Command>
        </PopoverContent>
        </Popover>
    )
    }