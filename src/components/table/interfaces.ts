export interface DataStructure {
  [date: string]: {
    isFestivity: boolean;
    rows: {
      [rowName: string]: {
        rowParents: string[];
        volumen: number;
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
  monthName: string;
  monthNum: number;
  days: number;
  year: number;
  total?: number;
}

export interface WeekStructure {
  weekNum: number;
  days: number;
  total?: number;
}
