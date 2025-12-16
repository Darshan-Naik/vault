import { Input } from "@/components/ui/input";
import { TBank } from "@/lib/types";

type BankProps = {
  data: TBank;
  handleChange: (key: string, value: string) => void;
};

const Bank = ({ data, handleChange }: BankProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Account Number
          </label>
          <Input
            placeholder="Enter account number"
            value={data?.accountNumber}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
            maxLength={20}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            IFSC Code
          </label>
          <Input
            placeholder="Enter IFSC code"
            value={data?.ifsc}
            onChange={(e) => handleChange("ifsc", e.target.value)}
            maxLength={20}
          />
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter password"
            value={data?.password}
            onChange={(e) => handleChange("password", e.target.value)}
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Master Password
          </label>
          <Input
            type="password"
            placeholder="Enter master password"
            value={data?.masterPassword}
            onChange={(e) => handleChange("masterPassword", e.target.value)}
            maxLength={50}
          />
        </div>
      </div>
    </div>
  );
};

export default Bank;
