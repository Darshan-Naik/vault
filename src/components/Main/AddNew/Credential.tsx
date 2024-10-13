import { Input } from "@/components/ui/input";
import { TCredential } from "@/lib/types";

type CredentialProps = {
  data: TCredential;
  handleChange: (key: string, value: string) => void;
};

const Credential = ({ data, handleChange }: CredentialProps) => {
  return (
    <>
      <Input
        placeholder="Id / Email / Mobile"
        value={data?.uid}
        onChange={(e) => handleChange("uid", e.target.value)}
        maxLength={50}
      />
      <Input
        placeholder="Password"
        value={data?.password}
        onChange={(e) => handleChange("password", e.target.value)}
        maxLength={50}
      />
      <Input
        placeholder="Master password"
        value={data?.masterPassword}
        onChange={(e) => handleChange("masterPassword", e.target.value)}
        maxLength={50}
      />
      <Input
        placeholder="URL"
        value={data?.url}
        onChange={(e) => handleChange("url", e.target.value)}
        maxLength={200}
      />
    </>
  );
};

export default Credential;
