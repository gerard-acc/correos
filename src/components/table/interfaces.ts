export interface SubColumn {
  [key: string]: number;
}

export interface CellState {
  [key: string]: boolean;
}

export interface RowData {
  [date: string]: number | SubColumn;
}

export interface DataStructure {
  [date: string]: {
    isFestivity: boolean;
    rows: {
      [rowName: string]: {
        rowParents: string[];
        volumen: number | SubColumn;
      };
    };
  };
}

export interface TableProps {
  data: DataStructure;
  periods: "weekly" | "daily";
}

export interface ColumnStructure {
  day: string;
  isFestivity: boolean;
  subColumns?: SubColumn;
}

export interface RowStructure {
  type: "parent" | "child";
  name: string;
  level: number;
  key?: string;
  parentKey?: string;
  rowData?: RowData;
  customValues?: { [date: string]: number | SubColumn };
  modifiedCells?: { [date: string]: boolean | CellState };
  verifiedCells?: { [date: string]: boolean | CellState };
  status?: "presentModifications" | "allVerified" | "noActivity";
}

export interface MonthStructure {
  [key: string]: {
    monthNum: number;
    monthName: string;
    year: number;
    days: number;
    total?: number;
  };
}

export interface WeekStructure {
  [key: number]: {
    days: number;
    total?: number;
  };
}
