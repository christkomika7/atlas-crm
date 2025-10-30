import { Dispatch, RefObject, SetStateAction } from "react";
import { ContractTableRef } from "../contract-table";
import ContractTable from "../contract-table";

type ClientTabProps = {
  contractTableRef: RefObject<ContractTableRef | null>;
  selectedContractIds: string[];
  setSelectedContractIds: Dispatch<SetStateAction<string[]>>;
};

export default function LessorTab({
  contractTableRef,
  selectedContractIds,
  setSelectedContractIds,
}: ClientTabProps) {
  return (
    <div className="pt-4">
      <ContractTable
        filter="LESSOR"
        ref={contractTableRef}
        selectedContractIds={selectedContractIds}
        setSelectedContractIds={setSelectedContractIds}
      />
    </div>
  );
}
