import { TCredential } from "@/lib/types";
import ValueCard from "./ValueCard";

type CredentialProps = {
  vault: TCredential;
  isEdit: boolean;
  handleChange: (id: string, value: string) => void;
};

const Credential = ({ vault, isEdit, handleChange }: CredentialProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ValueCard
          label="Username / Email"
          value={vault.uid}
          id="uid"
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
      </div>
      
      <ValueCard
        label="Master Password"
        value={vault.masterPassword}
        id="masterPassword"
        isEditable={isEdit}
        handleChange={handleChange}
      />
      
      <ValueCard
        label="Website URL"
        value={vault.url}
        id="url"
        isEditable={isEdit}
        handleChange={handleChange}
      />
      
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

export default Credential;
