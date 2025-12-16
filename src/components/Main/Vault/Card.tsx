import { TCard } from "@/lib/types";
import ValueCard from "./ValueCard";

type CardProps = {
  vault: TCard;
  isEdit: boolean;
  handleChange: (id: string, value: string) => void;
};

const Card = ({ vault, isEdit, handleChange }: CardProps) => {
  return (
    <div className="space-y-4">
      <ValueCard
        label="Card Number"
        value={vault.number}
        id="number"
        handleChange={handleChange}
        isEditable={isEdit}
      />
      
      <div className="grid gap-4 sm:grid-cols-3">
        <ValueCard
          label="CVV"
          value={vault.cvv}
          id="cvv"
          isEditable={isEdit}
          handleChange={handleChange}
        />
        <ValueCard
          label="PIN"
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

export default Card;
