type InvoiceContractProps = {
    id: string
}


export default function PurchaseOrderContract({ id }: InvoiceContractProps) {
    return (
        <div id={id}>
            <h1 className="font-black text-2xl">CONTRAT - BON DE COMMANDE</h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio, minima. Sint accusamus ipsum maiores sed doloremque praesentium repudiandae commodi molestiae cumque voluptatibus sapiente error non, numquam explicabo? Nisi, minus ad?</p>
        </div>
    )
}
