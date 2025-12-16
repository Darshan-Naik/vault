import { Input } from "@/components/ui/input";
import { TCredential } from "@/lib/types";

type CredentialProps = {
  data: TCredential;
  handleChange: (key: string, value: string) => void;
};

const Credential = ({ data, handleChange }: CredentialProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Username / Email
          </label>
          <Input
            placeholder="Enter username or email"
            value={data?.uid}
            onChange={(e) => handleChange("uid", e.target.value)}
            maxLength={50}
          />
        </div>
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
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Master Password (Optional)
        </label>
        <Input
          type="password"
          placeholder="Enter master password"
          value={data?.masterPassword}
          onChange={(e) => handleChange("masterPassword", e.target.value)}
          maxLength={50}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Website URL (Optional)
        </label>
        <Input
          placeholder="https://example.com"
          value={data?.url}
          onChange={(e) => handleChange("url", e.target.value)}
          maxLength={200}
        />
      </div>
    </div>
  );
};

export default Credential;
