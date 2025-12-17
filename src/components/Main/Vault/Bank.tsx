import { TBank } from "@/lib/types";
import ValueCard from "./ValueCard";

type BankProps = {
  vault: TBank;
  isEdit: boolean;
  handleChange: (id: string, value: string) => void;
};

const Bank = ({ vault, isEdit, handleChange }: BankProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ValueCard
          label="Account Number"
          value={vault.accountNumber}
          id="accountNumber"
          isEditable={isEdit}
          handleChange={handleChange}
        />
        <ValueCard
          label="Customer ID"
          value={vault.customerId}
          id="customerId"
          isEditable={isEdit}
          handleChange={handleChange}
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <ValueCard
          label="IFSC Code"
          value={vault.ifsc}
          id="ifsc"
          isEditable={isEdit}
          handleChange={handleChange}
        />
        <ValueCard
          label="Username"
          value={vault.username}
          id="username"
          isEditable={isEdit}
          handleChange={handleChange}
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
      
      <ValueCard
        label="Notes"
        value={vault.note}
        id="note"
        isEditable={isEdit}
        handleChange={handleChange}
        multiline
      />
    </div>
  );
};

export default Bank;
