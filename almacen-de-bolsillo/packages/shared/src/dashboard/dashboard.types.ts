export type DashboardRecord = { id: number; createdAt: string; total: number; isActive: boolean };
export type DashboardProduct = { id: number; shortname: string; stock: number; stockMin: number; isActive: boolean };
export type DashboardSummary = { sales: DashboardRecord[]; purchases: DashboardRecord[]; products: DashboardProduct[] };
