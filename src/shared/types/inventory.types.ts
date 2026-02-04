export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: 'kg' | 'm' | 'units' | 'L';
  minThreshold: number;
  location: string;
  isManufactured?: boolean;
}
