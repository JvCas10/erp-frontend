export const exportJson2Csv = (jsonData, filename = "data.csv") => {
    if (!jsonData || jsonData.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    if(!window.confirm("¿Estás seguro de exportar los datos a CSV?")) { return; }

    // Obtener los encabezados de las claves del JSON
    const headers = Object.keys(jsonData[0]);
    
    // Convertir a formato CSV
    const csvRows = [];
    
    // Agregar encabezados con BOM para Excel
    const headerString = headers.join(";");
    
    // Agregar filas de datos
    const rows = jsonData.map(obj => {
        return headers.map(header => {
            // Manejar valores nulos o undefined
            const value = obj[header] ?? '';
            // Escapar comillas dobles y envolver en comillas
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(";");
    });

    // Unir todas las filas
    const csvString = [headerString, ...rows].join("\n");

    // Crear un Blob con BOM para Excel
    const BOM = "\uFEFF"; // Agregar BOM para que Excel interprete correctamente los caracteres especiales
    const blob = new Blob([BOM + csvString], { 
        type: "text/csv;charset=utf-8;" 
    });

    // Crear un enlace de descarga
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // Simular clic en el enlace para descargar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
