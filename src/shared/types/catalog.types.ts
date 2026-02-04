export interface ProfileCatalogItem {
  sku: string;
  name: string;
  description: string;
}

export interface ProjectAccessory {
  id: string;
  projectId: string;
  inventoryItemId: string;
  quantityRequired: number;
  quantityAllocated: number;
  isFulfilled: boolean;
}
