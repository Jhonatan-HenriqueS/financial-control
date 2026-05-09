export interface User {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}
