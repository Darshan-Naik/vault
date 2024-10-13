import { TCredential } from "@/lib/types";
import ValueCard from "./ValueCard";

type CredentialProps = {
  vault: TCredential;
  isEdit: boolean;
  handleChange: (id: string, value: string) => void;
};

const Credential = ({ vault, isEdit, handleChange }: CredentialProps) => {
  return (
    <div className="space-y-4 flex-1">
      <ValueCard
        label="Id"
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
      <ValueCard
        label="Master Password"
        value={vault.masterPassword}
        id="masterPassword"
        isEditable={isEdit}
        handleChange={handleChange}
      />
      <ValueCard
        label="url"
        value={vault.url}
        id="url"
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

export default Credential;
