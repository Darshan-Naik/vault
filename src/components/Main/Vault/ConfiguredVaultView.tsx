import { getVaultConfig, RowConfig, FieldConfig } from "@/lib/configs";
import { TVault } from "@/lib/types";
import { cn } from "@/lib/utils";
import ValueCard from "./ValueCard";

type ConfiguredVaultViewProps = {
  vault: TVault;
  isEdit: boolean;
  handleChange: (key: string, value: string) => void;
};

const ConfiguredVaultView = ({
  vault,
  isEdit,
  handleChange,
}: ConfiguredVaultViewProps) => {
  const config = getVaultConfig(vault.type);

  if (!config) {
    return null;
  }

  const renderField = (field: FieldConfig) => (
    <ValueCard
      key={field.key}
      label={field.label}
      value={(vault as Record<string, unknown>)[field.key] as string | number | undefined}
      id={field.key}
      isEditable={isEdit}
      handleChange={handleChange}
    />
  );

  const renderRow = (row: RowConfig, index: number) => {
    const columns = row.columns || 2;
    const gridClass = cn(
      "grid gap-5",
      columns === 1 && "grid-cols-1",
      columns === 2 && "sm:grid-cols-2",
      columns === 3 && "sm:grid-cols-3"
    );

    return (
      <div key={index} className={gridClass}>
        {row.fields.map(renderField)}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {config.rows.map((row, index) => renderRow(row, index))}

      {/* Notes field - common to all vault types */}
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

export default ConfiguredVaultView;

