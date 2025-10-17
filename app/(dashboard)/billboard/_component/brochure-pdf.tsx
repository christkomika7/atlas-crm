
type BrochurePDFProps = {
  data: {
    companyName: string;
    type: string;
    capital: string;
    rccm: string;
    taxIdentificationNumber: string;
    address: string;
    AdvertiserName: string;
    AdvertiserPost: string;
    reference: string;
  };
};

export default function BrochurePDF({ }: BrochurePDFProps) {
  return (
    <div>BrochurePDF</div>
  )
}
