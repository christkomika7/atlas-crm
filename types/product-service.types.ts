import { $Enums } from '@/lib/generated/prisma';
import { CompanyType } from './company.types';

export type ProductServiceType = {
    id: string;
    type: $Enums.ProductServiceType,
    reference: string;
    category: string;
    designation: string;
    description?: string;
    unitPrice: string;
    quantity: number;
    cost: string;
    unitType: string;
    companyId: string;
    company: CompanyType<string>
}