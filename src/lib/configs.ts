import { KeyRound, Landmark, CreditCard, LucideIcon } from "lucide-react";

// Field configuration type
export type FieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "password";
  maxLength?: number;
  isSecret?: boolean; // Whether to mask the value
  multiline?: boolean;
  required?: boolean;
  fullWidth?: boolean; // Takes full row width
};

// Row configuration for grid layout
export type RowConfig = {
  columns?: 1 | 2 | 3; // Grid columns, default 2
  fields: FieldConfig[];
};

// Complete vault type configuration
export type VaultTypeConfig = {
  type: string;
  label: string;
  selectLabel: string; // Label shown in type selector
  icon: LucideIcon;
  rows: RowConfig[];
  // Default values when creating a new vault of this type
  defaultValues: Record<string, string | number>;
};

// Field configurations for each vault type
export const vaultConfigs: VaultTypeConfig[] = [
  {
    type: "CREDENTIAL",
    label: "Login Credential",
    selectLabel: "Password",
    icon: KeyRound,
    defaultValues: {
      uid: "",
      password: "",
      url: "",
    },
    rows: [
      {
        columns: 2,
        fields: [
          {
            key: "uid",
            label: "Username / Email",
            placeholder: "Enter username or email",
            maxLength: 50,
            isSecret: true,
          },
          {
            key: "password",
            label: "Password",
            placeholder: "Enter password",
            type: "password",
            maxLength: 50,
            isSecret: true,
          },
        ],
      },
      {
        columns: 1,
        fields: [
          {
            key: "masterPassword",
            label: "Master Password",
            placeholder: "Enter master password (optional)",
            type: "password",
            maxLength: 50,
            isSecret: true,
          },
        ],
      },
      {
        columns: 1,
        fields: [
          {
            key: "url",
            label: "Website URL",
            placeholder: "https://example.com",
            maxLength: 200,
          },
        ],
      },
    ],
  },
  {
    type: "BANK",
    label: "Bank Account",
    selectLabel: "Bank account",
    icon: Landmark,
    defaultValues: {
      accountNumber: "",
      customerId: "",
      username: "",
      password: "",
      masterPassword: "",
      ifsc: "",
    },
    rows: [
      {
        columns: 2,
        fields: [
          {
            key: "accountNumber",
            label: "Account Number",
            placeholder: "Enter account number",
            maxLength: 20,
            isSecret: true,
          },
          {
            key: "customerId",
            label: "Customer ID",
            placeholder: "Enter customer ID",
            maxLength: 30,
          },
        ],
      },
      {
        columns: 2,
        fields: [
          {
            key: "ifsc",
            label: "IFSC Code",
            placeholder: "Enter IFSC code",
            maxLength: 20,
          },
          {
            key: "username",
            label: "Username",
            placeholder: "Enter username",
            maxLength: 50,
            isSecret: true,
          },
        ],
      },
      {
        columns: 2,
        fields: [
          {
            key: "password",
            label: "Password",
            placeholder: "Enter password",
            type: "password",
            maxLength: 50,
            isSecret: true,
          },
          {
            key: "masterPassword",
            label: "Master Password",
            placeholder: "Enter master password",
            type: "password",
            maxLength: 50,
            isSecret: true,
          },
        ],
      },
    ],
  },
  {
    type: "CARD",
    label: "Payment Card",
    selectLabel: "Card",
    icon: CreditCard,
    defaultValues: {
      number: "",
      cvv: "",
      pin: "",
      expiry: "",
    },
    rows: [
      {
        columns: 1,
        fields: [
          {
            key: "number",
            label: "Card Number",
            placeholder: "Enter card number",
            maxLength: 20,
            isSecret: true,
          },
        ],
      },
      {
        columns: 3,
        fields: [
          {
            key: "cvv",
            label: "CVV",
            placeholder: "***",
            type: "password",
            maxLength: 5,
            isSecret: true,
          },
          {
            key: "pin",
            label: "PIN",
            placeholder: "****",
            type: "password",
            maxLength: 10,
            isSecret: true,
          },
          {
            key: "expiry",
            label: "Expiry",
            placeholder: "MM/YY",
            maxLength: 10,
          },
        ],
      },
    ],
  },
];

// Helper to get config by type
export const getVaultConfig = (type: string): VaultTypeConfig | undefined => {
  return vaultConfigs.find((config) => config.type === type);
};

// Generate encryptedKeys from config (fields with isSecret: true)
export const encryptedKeys = vaultConfigs.flatMap((config) =>
  config.rows.flatMap((row) =>
    row.fields.filter((field) => field.isSecret).map((field) => field.key)
  )
);

// Generate vaultTypes for select dropdown
export const vaultTypes = vaultConfigs.map((config) => ({
  label: config.selectLabel,
  value: config.type,
}));

// Generate iconMap
export const iconMap: Record<string, LucideIcon> = vaultConfigs.reduce(
  (acc, config) => {
    acc[config.type] = config.icon;
    return acc;
  },
  {} as Record<string, LucideIcon>
);

// Generate type labels
export const typeLabels: Record<string, string> = vaultConfigs.reduce(
  (acc, config) => {
    acc[config.type] = config.label;
    return acc;
  },
  {} as Record<string, string>
);

// Get default values for a vault type
export const getDefaultValues = (
  type: string
): Record<string, string | number> => {
  const config = getVaultConfig(type);
  return config?.defaultValues || {};
};
