import React, { useState } from 'react';
import '../../assets/styles/DynamicModal.css'; // Archivo de estilos

const DynamicModal = ({ isOpen, onClose, title, formFields, onSubmit, customFooter }) => {

    if (!isOpen) return null;

    const [previewImage, setPreviewImage] = useState(null);
    const [customValues, setCustomValues] = useState({}); // Estado para inputs personalizados

    // Manejar la previsualización de la imagen
    const handleImageChange = (e, onChange) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                onChange({ target: { name: e.target.name, value: reader.result } });
            };
            reader.readAsDataURL(file);
        }
    };

    // Manejar cambios en el select (opciones predefinidas)
    const handleSelectChange = (e, onChange) => {
        const { name, value } = e.target;
        setCustomValues((prev) => ({
            ...prev,
            [name]: value
        }));
        onChange({ target: { name, value } });
    };

    // Manejar cambios en el input de texto (opción personalizada)
    const handleCustomInputChange = (e, onChange) => {
        const { name, value } = e.target;
        setCustomValues((prev) => ({
            ...prev,
            [name]: value
        }));
        onChange({ target: { name, value } });
    };

    // Evitar números negativos en inputs de tipo "number"
    const handleNumberChange = (e, onChange) => {
        const { name, value } = e.target;
        if (value === "" || Number(value) >= 0) {
            onChange({ target: { name, value } });
        }
    };

    // Verificar si el boton debe estar habilitado
    const isButtonDisabled = formFields.some(field => 
        field.required && 
        field.type !== "file" && 
        (field.value === undefined || field.value === "" || field.value === null)
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>

                <form onSubmit={onSubmit}>
                    <div className="modal-grid">
                        {formFields.map((field, index) => (
                            <div key={index} className="form-group">
                                {field.type === "separator" ? (
                                    <hr hidden/>
                                ) : (
                                    <>
                                        <label>{field.label}</label>
                                        {field.type === "file" ? (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    name={field.name}
                                                    onChange={(e) => handleImageChange(e, field.onChange)}
                                                    required={field.required || false}
                                                    style={{width: "95%"}}
                                                />
                                                {(previewImage || field.src !== "Foto no disponible") && (
                                                    <div className="image-preview">
                                                        <img src={previewImage || field.src} alt="Preview" />
                                                    </div>
                                                )}
                                            </>
                                        ) : field.options ? (
                                            <>
                                                <select
                                                    name={field.name}
                                                    value={customValues[field.name] || ""}
                                                    onChange={(e) => handleSelectChange(e, field.onChange)}
                                                >
                                                    <option value="">{`Seleccionar ${field.label}`}</option>
                                                    {field.options.map((option) => (
                                                        typeof option === "object" && option !== null
                                                            ? <option key={option.value} value={option.value}>{option.label}</option>
                                                            : <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                {(!Array.isArray(field.options) || field.options.length === 0 || field.options.every(option => typeof option !== 'object')) && (
                                                    <input
                                                        type="text"
                                                        name={field.name}
                                                        placeholder={`O ingresa un ${field.label.toLowerCase()}`}
                                                        value={customValues[field.name] || field.value}
                                                        onChange={(e) => handleCustomInputChange(e, field.onChange)}
                                                        required={field.required || false}
                                                        disabled={field.disabled || false}
                                                        style={{width: "93%"}}
                                                    />
                                                )}
                                            </>
                                        ) : field.type === "number" ? (
                                            <input
                                                type="number"
                                                name={field.name}
                                                value={field.value}
                                                min="0"
                                                onChange={(e) => handleNumberChange(e, field.onChange)}
                                                onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                                                required={field.required || false}
                                                style={{width: "95%"}}
                                            />
                                        ) : (
                                            <input
                                                type={field.type || "text"}
                                                name={field.name}
                                                value={field.value}
                                                onChange={field.onChange}
                                                required={field.required || false}
                                                style={{width: "95%"}}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {customFooter && <div className="modal-custom-footer">{customFooter}</div>}

                    <div className="modal-actions">
                        <button 
                            type="submit" 
                            className="btn-submit" 
                            disabled={isButtonDisabled}
                        >
                            Guardar
                        </button>
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DynamicModal;