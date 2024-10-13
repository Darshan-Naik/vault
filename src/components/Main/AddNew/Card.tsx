import { Input } from "@/components/ui/input";
import { TCard } from "@/lib/types";

type CardProps = {
  data: TCard;
  handleChange: (key: string, value: string) => void;
};

const Card = ({ data, handleChange }: CardProps) => {
  return (
    <>
      <Input
        placeholder="Card number"
        value={data?.number}
        onChange={(e) => handleChange("number", e.target.value)}
        maxLength={20}
      />
      <Input
        placeholder="cvv"
        value={data?.cvv}
        onChange={(e) => handleChange("cvv", e.target.value)}
        maxLength={5}
      />
      <Input
        placeholder="Pin"
        value={data?.pin}
        onChange={(e) => handleChange("pin", e.target.value)}
        maxLength={10}
      />
      <Input
        placeholder="Expiry"
        value={data?.expiry}
        onChange={(e) => handleChange("expiry", e.target.value)}
        maxLength={10}
      />
    </>
  );
};

export default Card;
