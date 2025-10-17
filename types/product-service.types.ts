import { $Enums } from '@/lib/generated/prisma';
import { CompanyType } from './company.types';
import Decimal from 'decimal.js';

export type ProductServiceType = {
    id: string;
    type: $Enums.ProductServiceType,
    reference: string;
    hasTax: boolean;
    category: string;
    designation: string;
    description?: string;
    unitPrice: Decimal;
    quantity: number;
    cost: Decimal;
    unitType: string;
    companyId: string;
    company: CompanyType<string>
}