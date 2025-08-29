export interface SubColumn {
  [key: string]: number;
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
  rowData?: { [date: string]: number };
  parentKey?: string;
  customValues?: { [date: string]: number };
  modifiedCells?: { [date: string]: boolean };
  verifiedCells?: { [date: string]: boolean };
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
