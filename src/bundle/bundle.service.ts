import { Injectable } from '@nestjs/common';
import { Product } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';

export interface IBundleRes {
  discount: number;
  id: number;
  products: Product[];
}

@Injectable()
export class BundleService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBundleDto) {
    return await this.prisma.bundle.create({
      data: {
        products: {
          connect: data.products.map((id) => ({ id }))
        },
        discount: +data.discount
      }
    });
  }

  async update(id: number, data: UpdateBundleDto) {
    return await this.prisma.bundle.update({
      where: { id },
      data: {
        products: data?.products && {
          set: data.products.map((id) => ({ id }))
        },
        discount: Number(data?.discount || 0)
      },
      include: { products: true }
    });
  }

  async remove(id: number) {
    return await this.prisma.bundle.delete({ where: { id } });
  }

  async getAll() {
    return await this.prisma.bundle.findMany({ include: { products: true } });
  }

  async getProductsWithPrice(selectedIds: number[]): Promise<IBundleRes[]> {
    const bundels = await this.getAll();
    const selected = new Set(selectedIds);
    const groups = [];
    const used = new Set<number>();
    for (const b of bundels) {
      const ids = b.products.map((el) => el.id);
      const fullySelected =
        ids.length > 0 && ids.every((el) => selected.has(el));
      if (!fullySelected) continue;

      const hasConflict = ids.some((id) => used.has(id));
      if (hasConflict) continue;

      ids.forEach((id) => used.add(id));

      const discount = b.discount / b.products.length;
      const withSalePrice = {
        ...b,
        products: b.products.map((el) => ({
          ...el,
          sale_price: el.price - discount
        }))
      };

      groups.push(withSalePrice);
    }
    const leftOvers = Array.from(selected).filter((id) => !used.has(id));
    const products = await this.prisma.product.findMany({
      where: { id: { in: leftOvers } }
    });

    if (products.length > 0) {
      groups.push({
        discount: 0,
        id: -1,
        products
      });
    }

    return groups;
  }

  async getProductPriceFromBundle(productIds: number[]) {
    const product = (await this.getProductsWithPrice(productIds))
      .flatMap((bundle) => bundle.products)
      .sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price))[0];
    return product.sale_price ?? product.price;
  }
}
