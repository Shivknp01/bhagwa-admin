export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface AuthService {
  getCurrentAdmin(): Promise<AdminProfile>;
  logout(): Promise<void>;
}

class MockAuthService implements AuthService {
  private admin: AdminProfile = {
    id: "admin_001",
    name: "Aditya Sharma",
    email: "admin@bhagwa.app",
    role: "Super Admin",
    avatar: "https://i.pravatar.cc/150?img=68",
  };

  async getCurrentAdmin(): Promise<AdminProfile> {
    return this.admin;
  }

  async logout(): Promise<void> {
    console.log("Mock logout executed");
  }
}

export const authService: AuthService = new MockAuthService();
