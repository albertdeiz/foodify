import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductWithDetails,
  PublicProductDetail,
  ComboItem,
  CreateComboItemInput,
  UpdateComboItemInput,
} from '../entities/product.entity'

export interface IProductRepository {
  findByWorkspaceId(workspaceId: number): Promise<Product[]>
  findById(id: number): Promise<Product | null>
  findByIdWithDetails(id: number): Promise<ProductWithDetails | null>
  findPublicByIdInWorkspace(productId: number, workspaceId: number): Promise<PublicProductDetail | null>
  findByCategoryId(categoryId: number): Promise<Product[]>
  create(input: CreateProductInput): Promise<Product>
  update(id: number, input: UpdateProductInput): Promise<Product>
  delete(id: number): Promise<void>
  // Category assignment
  assignToCategory(productId: number, categoryId: number, order?: number): Promise<void>
  removeFromCategory(productId: number, categoryId: number): Promise<void>
  // Complement type assignment
  assignComplementType(productId: number, complementTypeId: number): Promise<void>
  removeComplementType(productId: number, complementTypeId: number): Promise<void>
  // ComboItem management
  findComboItems(comboProductId: number): Promise<ComboItem[]>
  addComboItem(comboProductId: number, input: CreateComboItemInput): Promise<ComboItem>
  updateComboItem(itemId: number, input: UpdateComboItemInput): Promise<ComboItem>
  deleteComboItem(itemId: number): Promise<void>
}
