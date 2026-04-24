import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}



  // =============================================================================
  //                               EXIST
  // =============================================================================

  async existsById(id: number): Promise<boolean> {
    const count = await this.categoryRepository.countById(id);
    return count > 0;
  }
}
