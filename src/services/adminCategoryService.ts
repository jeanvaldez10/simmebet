export interface AdminCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    marketAssignments: number;
  };
  marketAssignments?: {
    id: string;
    market: {
      id: string;
      name: string;
      question: string;
      status: string;
    };
  }[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export class AdminCategoryService {
  private static getHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  static async getCategories(): Promise<AdminCategory[]> {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch categories");
      }

      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  static async getCategoryById(id: string): Promise<AdminCategory> {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch category");
      }

      const data = await response.json();
      return data.category;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  }

  static async createCategory(
    categoryData: CreateCategoryData
  ): Promise<AdminCategory> {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(categoryData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      const data = await response.json();
      return data.category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  static async updateCategory(
    id: string,
    categoryData: UpdateCategoryData
  ): Promise<AdminCategory> {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(categoryData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update category");
      }

      const data = await response.json();
      return data.category;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
}
