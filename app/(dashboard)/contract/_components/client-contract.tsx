import { getCountryFrenchName } from '@/lib/helper'
import { formatNumber } from '@/lib/utils'
import { ClientContractType } from '@/types/contract-types'
import React from 'react'

type ClientContractProps = {
    contract: ClientContractType
}

export default function ClientContract({ contract }: ClientContractProps) {



    return (
        <div id="contract" className='w-full py-5'>
            <div className='h-5'></div>
            <div className='grid grid-cols-[20px_1fr_20px] mb-3'>
                <div></div>
                <h1 className='p-6 text-xl border-8 text-center border-black' style={{ fontWeight: 900 }}>CONTRAT DE LOCATION DE PANNEAUX PUBLICITAIRES <br /> {getCountryFrenchName(contract.company.country)?.toUpperCase()}</h1>
                <div></div>
            </div>
            <div className='mx-5'>
                <h2 className='mb-5' style={{ fontWeight: 600 }}>D'autre part,</h2>
                <div className='text-sm mb-5 gri grid-cols-1'>
                    <p><span className='font-semibold'>Nom : </span> {contract.client.companyName}</p>
                    <p><span className='font-semibold'>Type : </span> {contract.client.businessSector}</p>
                    <p><span className='font-semibold'>Capital : </span> {contract.company.companyName}</p>
                    <p><span className='font-semibold'>Siège social : </span> {contract.company.companyName}</p>
                    <p><span className='font-semibold'>RCCM : </span> {contract.company.companyName}</p>
                    <p><span className='font-semibold'>NIU : </span> {contract.company.companyName}</p>
                </div>
                <h2 className='bg-amber-100' style={{ fontWeight: 600, marginBottom: 5, width: "100%" }}>Et d'autre part,</h2>
                <div className='text-sm'>
                    <p><span className='font-semibold'>Nom : </span> {contract.company.companyName}</p>
                    <p><span className='font-semibold'>Type : </span> {contract.company.businessActivityType}</p>
                    <p><span className='font-semibold'>Capital : </span> {formatNumber(contract.company.capitalAmount)} {contract.company.currency}</p>
                    <p><span className='font-semibold'>Siège social : </span> {contract.company.registeredAddress}</p>
                    <p><span className='font-semibold'>RCCM : </span> {contract.company.businessRegistrationNumber}</p>
                    <p><span className='font-semibold'>NIU : </span> {contract.company.taxIdentificationNumber}</p>
                </div>

            </div>
        </div>
    )
}
