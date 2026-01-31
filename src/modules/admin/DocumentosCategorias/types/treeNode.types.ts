export interface ITreeNode {
  id: string
  label: string
  children?: ITreeNode[] | undefined
}

export interface ITreeNodeLista {
  key: string;            // Identificador único del nodo
  data: {
    name: string;         // Nombre del nodo (nombre de categoría o documento)
    size?: string;        // Tamaño del nodo (solo para documentos o según tu necesidad)
    type?: string;        // Tipo del nodo ('Folder', 'PDF', etc.)
    pdfUrl?: string;      // URL del PDF si es un documento
  };
  children?: ITreeNodeLista[] | undefined;  // Nodos hijos (subcategorías, subsubcategorías o documentos)
  leaf?: boolean;         // Si es un nodo hoja (nodo sin hijos)
  expanded?: boolean;     // Si el nodo está expandido o no
  selectable?: boolean;   // Si el nodo puede ser seleccionado o no
  icon?: string;          // Icono para representar el nodo (opcional)
}
