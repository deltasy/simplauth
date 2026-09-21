import type { InputProps } from "./Input";

type ReactiveInputProps = InputProps & {
    originalValue: boolean
    validChange: boolean,
    children?: React.ReactNode
    editFunction: (field: string, value: string) => void,
}

export default function ReactiveInput({ 
    field, 
    value,
    originalValue,
    validChange,
    type = "text",
    placeholder,
    children,
    setFunction,
    editFunction,
    className = "bg-white text-black rounded-md p-2",

}: ReactiveInputProps){
    const inputId = `${field}-reactive-input`

    return (
        <>
            <label htmlFor={inputId} className="block mb-1">{placeholder}</label>
            <input
                id={inputId}
                type={type}
                placeholder={placeholder}
                className={className}
                value={value || ""}
                onChange={(e) => setFunction(e.target.value)}
            />

            {
                value && !originalValue ? (
                    validChange ? (
                        <button 
                            className="bg-green-600 p-1 px-3 ml-3 rounded-md font-bold cursor-pointer hover:bg-green-700"
                            onClick={(e) => editFunction(field, value)}
                        >✓</button>
                    ) : (
                        <div className="text-red-500 font-medium mt-1">
                            {placeholder} já existente
                        </div>
                    )
                ) : ""
            }  

            {
                children ? children : ""
            }
        </>
    )
}