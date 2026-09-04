import { Input } from "@/components/ui/input";
import {
  getVaultConfig,
  RowConfig,
  FieldConfig,
  TCustomField,
  VaultFieldValue,
} from "@vault/shared";
import { cn } from "@vault/shared";
import CustomFieldsEditor from "../CustomFieldsEditor";

type ConfiguredFormProps = {
  type: string;
  data: Record<string, unknown>;
  handleChange: (key: string, value: VaultFieldValue) => void;
};

const ConfiguredForm = ({ type, data, handleChange }: ConfiguredFormProps) => {
  const config = getVaultConfig(type);

  if (!config) {
    return null;
  }

  const renderField = (field: FieldConfig) => (
    <div key={field.key} className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {field.label}
      </label>
      <Input
        type={field.type || "text"}
        placeholder={field.placeholder}
        value={(data?.[field.key] as string) || ""}
        onChange={(e) => handleChange(field.key, e.target.value)}
        maxLength={field.maxLength}
      />
    </div>
  );

  const renderRow = (row: RowConfig, index: number) => {
    const columns = row.columns || 2;
    const gridClass = cn(
      "grid gap-4",
      columns === 1 && "grid-cols-1",
      columns === 2 && "sm:grid-cols-2",
      columns === 3 && "grid-cols-3"
    );

    return (
      <div key={index} className={gridClass}>
        {row.fields.map(renderField)}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {config.rows.map((row, index) => renderRow(row, index))}
      <CustomFieldsEditor
        fields={(data?.customFields as TCustomField[]) || []}
        onChange={(fields) => handleChange("customFields", fields)}
      />
    </div>
  );
};

export default ConfiguredForm;

