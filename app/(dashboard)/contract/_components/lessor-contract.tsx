import { LessorContractType } from "@/types/contract-types"

type LessorContractProps = {
  contract: LessorContractType
}

export default function LessorContract({ contract }: LessorContractProps) {
  return (
    <div id="contract">Contract</div>
  )
}
