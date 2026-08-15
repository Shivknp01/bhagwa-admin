import { User } from "@/models/user";
import { initialMockUsers } from "@/data/mock/users";

export interface UserRepository {
  getUsers(query?: string, statusFilter?: string): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  updateUserStatus(id: string, status: "active" | "inactive" | "banned"): Promise<User>;
}

class MockUserRepository implements UserRepository {
  private users: User[] = [...initialMockUsers];

  async getUsers(query?: string, statusFilter?: string): Promise<User[]> {
    let list = [...this.users];
    if (statusFilter && statusFilter !== "all") {
      list = list.filter((u) => u.status === statusFilter);
    }
    if (query && query.trim() !== "") {
      const q = query.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.identifier.toLowerCase().includes(q) ||
          u.device.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async updateUserStatus(id: string, status: "active" | "inactive" | "banned"): Promise<User> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error(`User ${id} not found`);
    this.users[idx] = { ...this.users[idx], status };
    return this.users[idx];
  }
}

export const userRepository: UserRepository = new MockUserRepository();
