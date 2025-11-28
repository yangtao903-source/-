export interface ShoppingItem {
  id: string;
  name: string;
  isBought: boolean;
  category: string;
}

export interface GroupedItems {
  [category: string]: ShoppingItem[];
}

export interface ShoppingHistoryRecord {
  id: string;
  timestamp: number;
  items: ShoppingItem[];
}

export enum SortMode {
  MANUAL = 'MANUAL',
  CATEGORY = 'CATEGORY',
}