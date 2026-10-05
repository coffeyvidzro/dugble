export type TeamTokenPermission = {
  value: string;
  label: string;
};

export type TeamTokenPermissionCategory = {
  id: string;
  label: string;
  permissions: TeamTokenPermission[];
};

export const TEAM_TOKEN_PERMISSION_CATEGORIES: TeamTokenPermissionCategory[] = [
  {
    id: "sender_identity",
    label: "Sender identity",
    permissions: [
      { value: "sender_ids:read", label: "View sender IDs" },
      { value: "sender_ids:create", label: "Create sender IDs" },
      { value: "sender_ids:delete", label: "Delete sender IDs" },
      { value: "sender_domains:read", label: "View sender domains" },
      { value: "sender_domains:create", label: "Create sender domains" },
      { value: "sender_domains:delete", label: "Delete sender domains" },
    ],
  },
  {
    id: "messaging",
    label: "Messaging",
    permissions: [
      { value: "sms:read", label: "View SMS messages and history" },
      { value: "sms:send", label: "Send SMS messages" },
      { value: "email:read", label: "View email messages and history" },
      { value: "email:send", label: "Send email messages" },
    ],
  },
  {
    id: "verify",
    label: "Verification",
    permissions: [
      { value: "verify:read", label: "View verification requests" },
      { value: "verify:send", label: "Send verification codes" },
      { value: "verify:check", label: "Check verification codes" },
      { value: "verify:manage", label: "Manage verification settings" },
    ],
  },
  {
    id: "topics_segments",
    label: "Topics & segments",
    permissions: [
      { value: "topics:read", label: "View topics" },
      { value: "topics:write", label: "Create or update topics" },
      { value: "segments:read", label: "View segments" },
      { value: "segments:write", label: "Create or update segments" },
    ],
  },
  {
    id: "contacts",
    label: "Contacts",
    permissions: [
      { value: "contacts:read", label: "View contacts" },
      {
        value: "contacts:write",
        label: "Create, update, or delete contacts",
      },
      {
        value: "contact_properties:read",
        label: "View contact properties schema",
      },
      {
        value: "contact_properties:write",
        label: "Modify contact properties schema",
      },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    permissions: [
      { value: "templates:read", label: "View message templates" },
      { value: "templates:write", label: "Create or update templates" },
    ],
  },
  {
    id: "broadcasts",
    label: "Broadcasts",
    permissions: [
      { value: "broadcasts:read", label: "View broadcast campaigns" },
      { value: "broadcasts:write", label: "Create or update broadcasts" },
      { value: "broadcasts:send", label: "Send broadcast campaigns" },
    ],
  },
  {
    id: "suppressions",
    label: "Suppressions",
    permissions: [
      { value: "suppressions:read", label: "View suppression list" },
      {
        value: "suppressions:write",
        label: "Add or remove suppressions",
      },
    ],
  },
];

export const ALL_TEAM_TOKEN_PERMISSIONS: string[] =
  TEAM_TOKEN_PERMISSION_CATEGORIES.flatMap((category) =>
    category.permissions.map((p) => p.value),
  );

const PERMISSION_LABEL_MAP: Record<string, string> = Object.fromEntries(
  TEAM_TOKEN_PERMISSION_CATEGORIES.flatMap((category) =>
    category.permissions.map((p) => [p.value, p.label] as const),
  ),
);

export function getPermissionLabel(value: string): string {
  return PERMISSION_LABEL_MAP[value] ?? value;
}

const READ_ONLY_PERMISSIONS = ALL_TEAM_TOKEN_PERMISSIONS.filter((p) =>
  p.endsWith(":read"),
);

const MEMBER_PERMISSIONS = [...READ_ONLY_PERMISSIONS, "broadcasts:write"];

const ADMIN_PERMISSIONS = ALL_TEAM_TOKEN_PERMISSIONS;

const OWNER_PERMISSIONS = ALL_TEAM_TOKEN_PERMISSIONS;

export const PERMISSION_PRESETS = {
  read_only: { label: "Read-only", permissions: READ_ONLY_PERMISSIONS },
  member: { label: "Member-equivalent", permissions: MEMBER_PERMISSIONS },
  admin: { label: "Admin-equivalent", permissions: ADMIN_PERMISSIONS },
  owner: { label: "Owner-equivalent", permissions: OWNER_PERMISSIONS },
} as const;

export type PermissionPresetKey = keyof typeof PERMISSION_PRESETS;
