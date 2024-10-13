import { Input } from "@/components/ui/input";
import { TBank } from "@/lib/types";

type BankProps = {
  data: TBank;
  handleChange: (key: string, value: string) => void;
};

const Bank = ({ data, handleChange }: BankProps) => {
  return (
    <>
      <Input
        placeholder="Account number"
        value={data?.accountNumber}
        onChange={(e) => handleChange("accountNumber", e.target.value)}
        maxLength={20}
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
        placeholder="ifsc"
        value={data?.ifsc}
        onChange={(e) => handleChange("ifsc", e.target.value)}
        maxLength={20}
      />
    </>
  );
};

export default Bank;
