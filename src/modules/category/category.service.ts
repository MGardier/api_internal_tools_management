import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CategoryNameSummary } from './types';

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

  // =============================================================================
  //                               FIND BY NAME
  // =============================================================================

  findByName(name: string): Promise<CategoryNameSummary | null> {
    return this.categoryRepository.findByName(name);
  }
}
