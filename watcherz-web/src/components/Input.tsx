interface InputProps {
    field: string,
    value: string,
    type?: "text" | "password",
    placeholder: string,
    setFunction: (value: string) => void,
    className?: string,
}

export default function Input({ 
    field, 
    value,
    type = "text",
    placeholder,
    setFunction,
    className = "bg-white text-black rounded-md p-2 mb-6",
}: InputProps){
    const inputId = `${field}-input`

    return (
        <div>
            <label htmlFor={inputId} className="block mb-1">{placeholder}</label>
            <input
                id={inputId}
                type={type}
                placeholder={placeholder}
                className={className}
                value={value}
                onChange={(e) => setFunction(e.target.value)}
            />
        </div>
    )
}