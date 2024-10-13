import { TBank } from "@/lib/types";
import ValueCard from "./ValueCard";

type BankProps = {
  vault: TBank;
  isEdit: boolean;
  handleChange: (id: string, value: string) => void;
};

const Bank = ({ vault, isEdit, handleChange }: BankProps) => {
  return (
    <div className="space-y-4 flex-1">
      <ValueCard
        label="Account number"
        value={vault.accountNumber}
        id="accountNumber"
        isEditable={isEdit}
        handleChange={handleChange}
      />
      <ValueCard
        label="Password"
        value={vault.password}
        id="password"
        isEditable={isEdit}
        handleChange={handleChange}
      />
      <ValueCard
        label="Master Password"
        value={vault.masterPassword}
        id="masterPassword"
        isEditable={isEdit}
        handleChange={handleChange}
      />
      <ValueCard
        label="ifsc"
        value={vault.ifsc}
        id="ifsc"
        isEditable={isEdit}
        handleChange={handleChange}
      />
      <ValueCard
        label="Note"
        value={vault.note}
        id="note"
        className="min-h-40"
        isEditable={isEdit}
        handleChange={handleChange}
      />
    </div>
  );
};

export default Bank;
