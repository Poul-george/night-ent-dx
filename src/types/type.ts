export type User = {
  id: number;
  name: string;
  email: string;
  storeId: number;
  createdAt: string;
};

export type Store = {
  id: number;
  name: string;
  address: string | null;
  createdAt: string;
};
