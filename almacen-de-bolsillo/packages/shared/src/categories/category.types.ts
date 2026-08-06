export type Category = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryDto = {
  name: string;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
