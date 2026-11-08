
export enum FieldType {
  Master = 'Master',
  Under15_18 = 'Under 15/18',
  Senior = 'Senior',
  Flag = 'Flag',
}

export interface FieldConfig {
  totalLength: number;
  totalWidth: number;
  endzoneDepth: number;
  continuousLines: number[]; // yard lines from goal line
  dashedLines: number[]; // yard lines from goal line
  hasTechArea: boolean;
  techArea?: {
    startYard: number;
    depth: number;
    offset: number;
  };
  hasHashMarks: boolean;
  hashMarkPositions?: number[]; // fractions of width, e.g. [3/8, 5/8]
  hasNumbers: boolean;
  numberOffset?: number; // distance from sideline in yards
  flagMarkers?: {
    distanceFromGoal: number;
    length: number;
  };
  hasCenterHashMark?: boolean;
}