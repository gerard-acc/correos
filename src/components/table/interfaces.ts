export interface DataStructure {
  [date: string]: {
    [rowName: string]: {
      rowParents: string[];
      volumen: number;
    };
  };
}

export interface TableProps {
  data: DataStructure;
  periods: "weekly" | "daily";
}

export interface RowStructure {
  type: "parent" | "child";
  name: string;
  level: number;
  key?: string;
  rowData?: { [date: string]: number };
  parentKey?: string;
}
