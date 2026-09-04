import { useState } from "react";
import { Plus, Trash2, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TCustomField, createCustomField } from "@vault/shared";
import { cn } from "@vault/shared";

type CustomFieldsEditorProps = {
  fields?: TCustomField[];
  onChange: (fields: TCustomField[]) => void;
};

const CustomFieldsEditor = ({ fields = [], onChange }: CustomFieldsEditorProps) => {
  const [focusId, setFocusId] = useState<string | null>(null);

  const updateField = (id: string, patch: Partial<TCustomField>) => {
    onChange(fields.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };

  const addField = () => {
    const field = createCustomField();
    onChange([...fields, field]);
    setFocusId(field.id);
  };

  const removeField = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <div className="flex items-center gap-1">
            <input
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              placeholder="Field name"
              autoFocus={field.id === focusId}
              maxLength={50}
              className={cn(
                "flex-1 min-w-0 bg-transparent text-xs font-medium outline-none",
                "text-muted-foreground placeholder:text-muted-foreground/50"
              )}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => updateField(field.id, { isSecret: !field.isSecret })}
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-card",
                    field.isSecret && "text-primary"
                  )}
                  aria-label={field.isSecret ? "Store as visible text" : "Hide and encrypt value"}
                >
                  {field.isSecret ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <LockOpen className="w-3.5 h-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {field.isSecret ? "Hidden & encrypted" : "Hide and encrypt"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-card transition-colors"
                  aria-label="Remove field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Remove field</TooltipContent>
            </Tooltip>
          </div>
          <Input
            type="text"
            placeholder={field.label.trim() ? `Enter ${field.label.toLowerCase()}` : "Enter value"}
            value={field.value}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
            maxLength={500}
            autoComplete="off"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addField}
        className="gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Add field
      </Button>
    </div>
  );
};

export default CustomFieldsEditor;
