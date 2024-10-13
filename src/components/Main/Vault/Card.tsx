import { TCard } from "@/lib/types";
import ValueCard from "./ValueCard";

type CardProps = {
  vault: TCard;
  isEdit: boolean;
  handleChange: (id: string, value: string) => void;
};

const Card = ({ vault, isEdit, handleChange }: CardProps) => {
  return (
    <div className="space-y-4 flex-1">
      <ValueCard
        label="Card number"
        value={vault.number}
        id="number"
        handleChange={handleChange}
        isEditable={isEdit}
      />
      <ValueCard
        label="cvv"
        value={vault.cvv}
        id="cvv"
        isEditable={isEdit}
        handleChange={handleChange}
      />
      <ValueCard
        label="Pin"
        value={vault.pin}
        id="pin"
        isEditable={isEdit}
        handleChange={handleChange}
      />
      <ValueCard
        label="Expiry"
        value={vault.expiry}
        id="expiry"
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

export default Card;
