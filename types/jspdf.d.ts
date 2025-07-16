declare module 'jspdf' {
  interface jsPDF {
    internal: {
      pages: any[];
      pageSize: {
        width: number;
        height: number;
      };
    };
  }
}

declare module 'jspdf-autotable' {
  interface UserOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    styles?: any;
    headStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
    margin?: any;
  }
  
  function autoTable(doc: any, options: UserOptions): void;
  export = autoTable;
}
