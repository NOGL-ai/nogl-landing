// Forecasting / Alert Overview types — used by client UI + mock API.

export interface ReorderInfo {
    label: string;
    type: "purple" | "blue" | "gray";
    days: string;
    daysColor: "red" | "orange" | "blue" | "purple" | "gray";
}

export interface StockInfo {
    current: number;
    incoming: number;
    preorder: number;
    reserved: number;
}

export interface OosInfo {
    date: string;
    eta: string;
    tone: "red" | "orange" | "muted";
}

export interface ReachInfo {
    days: string;
    label: "Overstock" | "Reorder" | "Out of stock" | "OK" | "Critical";
    segs: number[]; // length 5, 0/1
}

export interface OosImpactInfo {
    ok: boolean;
    potential?: boolean;
    value?: string | null;
    units?: string;
    text?: string;
}

export interface ReleasableInfo {
    value: string;
    units: string;
}

export interface ForecastRow {
    id: number;
    badges: string[];
    name: string;
    size: string;
    sku: string;
    warehouses: number;
    wh: string;
    reorder: ReorderInfo;
    stock: StockInfo;
    oos: OosInfo;
    reach: ReachInfo;
    oosImpact: OosImpactInfo;
    relCurrent: ReleasableInfo | null;
    relIncoming: ReleasableInfo | null;
    oosImpactSort: number;
}

export interface ForecastTab {
    id: string;
    label: string;
    count: number;
}
