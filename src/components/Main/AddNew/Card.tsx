import { Input } from "@/components/ui/input";
import { TCard } from "@/lib/types";

type CardProps = {
  data: TCard;
  handleChange: (key: string, value: string) => void;
};

const Card = ({ data, handleChange }: CardProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Card Number
        </label>
        <Input
          placeholder="Enter card number"
          value={data?.number}
          onChange={(e) => handleChange("number", e.target.value)}
          maxLength={20}
        />
      </div>
      
      <div className="grid gap-4 grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            CVV
          </label>
          <Input
            type="password"
            placeholder="***"
            value={data?.cvv}
            onChange={(e) => handleChange("cvv", e.target.value)}
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            PIN
          </label>
          <Input
            type="password"
            placeholder="****"
            value={data?.pin}
            onChange={(e) => handleChange("pin", e.target.value)}
            maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Expiry
          </label>
          <Input
            placeholder="MM/YY"
            value={data?.expiry}
            onChange={(e) => handleChange("expiry", e.target.value)}
            maxLength={10}
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
