export interface CategoryData {
  id: string;
  name: string;
  icon?: string | null;
  _count: {
    markets: number;
  };
}

export class CategoryService {
  static async getCategories(): Promise<CategoryData[]> {
    try {
      const response = await fetch("/api/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }
}
