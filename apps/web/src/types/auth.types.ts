export type UserRole = 'ADMIN' | 'STORE_OWNER';

export interface AuthUser {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  phoneNumber: string | null;
  role: UserRole;
  storeId: string | null;
  store: { id: string; name: string } | null;
  isActive: boolean;
  createdAt: string;
}
