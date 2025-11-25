'use client';

import { ChevronDownIcon } from '@/components/icons';
import DeliveryNoteModal from '@/components/modal/delivery-note-modal';
import InvoiceModal from '@/components/modal/invoice-modal';
import ModalContainer from '@/components/modal/modal-container';
import PurchaseOrderModal from '@/components/modal/purchase-order-modal';
import QuoteModal from '@/components/modal/quote-modal';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SetStateAction, useRef, useState } from 'react'

type ActionButtonProps = {
    quotePermission: boolean;
    invoicePermission: boolean;
    deliveryNotePermission: boolean;
    purchaseOrderPermission: boolean;
}

export default function ActionButton({ quotePermission, invoicePermission, deliveryNotePermission, purchaseOrderPermission }: ActionButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState({
        invoice: false,
        quote: false,
        deliveryNote: false,
        purchaseOrder: false

    })
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button ref={ref} variant="primary" className="!h-full flex items-center text-base font-medium">
                    Ajouter <ChevronDownIcon className="!size-4 stroke-white relative top-0.5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-1" style={{
                width: ref.current?.clientWidth
            }}>
                {quotePermission &&
                    <ModalContainer
                        size="2xl"
                        action={
                            <Button
                                variant="primary"
                                className="bg-white hover:bg-blue justify-start shadow-none !h-12 text-black hover:text-white transition-[color,background-color,box-shadow]"
                            >
                                Créer un devis
                            </Button>

                        }
                        title="Devis"
                        open={open.quote}
                        setOpen={function (value: SetStateAction<boolean>): void {
                            setOpen((prev) => ({ ...prev, quote: value as boolean }));
                        }}
                    >
                        <QuoteModal
                            refreshData={() => { }}
                            closeModal={() =>
                                setOpen((prev) => ({ ...prev, quote: false }))
                            }
                        />
                    </ModalContainer>
                }
                {invoicePermission &&
                    <ModalContainer
                        size="2xl"
                        action={
                            <Button
                                variant="primary"
                                className="bg-white hover:bg-blue justify-start shadow-none !h-12 text-black hover:text-white transition-[color,background-color,box-shadow]"
                            >
                                Créer une facture
                            </Button>

                        }
                        title="Facture"
                        open={open.invoice}
                        setOpen={function (value: SetStateAction<boolean>): void {
                            setOpen((prev) => ({ ...prev, invoice: value as boolean }));
                        }}
                    >
                        <InvoiceModal
                            refreshData={() => { }}
                            closeModal={() =>
                                setOpen((prev) => ({ ...prev, invoice: false }))
                            }
                        />
                    </ModalContainer>
                }
                {deliveryNotePermission &&
                    <ModalContainer
                        size="2xl"
                        action={
                            <Button
                                variant="primary"
                                className="bg-white hover:bg-blue justify-start shadow-none !h-12 text-black hover:text-white transition-[color,background-color,box-shadow]"
                            >
                                Créer un bon de livraison
                            </Button>

                        }
                        title="Bon de livraison"
                        open={open.deliveryNote}
                        setOpen={function (value: SetStateAction<boolean>): void {
                            setOpen((prev) => ({ ...prev, deliveryNote: value as boolean }));
                        }}
                    >
                        <DeliveryNoteModal
                            refreshData={() => { }}
                            closeModal={() =>
                                setOpen((prev) => ({ ...prev, deliveryNote: false }))
                            }
                        />
                    </ModalContainer>
                }
                {purchaseOrderPermission &&
                    <ModalContainer
                        size="2xl"
                        action={
                            <Button
                                variant="primary"
                                className="bg-white justify-start hover:bg-blue shadow-none !h-12 text-black hover:text-white transition-[color,background-color,box-shadow]"
                            >
                                Créer un bon de commande
                            </Button>

                        }
                        title="Bon de commande"
                        open={open.purchaseOrder}
                        setOpen={function (value: SetStateAction<boolean>): void {
                            setOpen((prev) => ({ ...prev, purchaseOrder: value as boolean }));
                        }}
                    >
                        <PurchaseOrderModal
                            refreshData={() => { }}
                            closeModal={() =>
                                setOpen((prev) => ({ ...prev, receipt: false }))
                            }
                        />
                    </ModalContainer>
                }
            </PopoverContent>
        </Popover>
    )
}
