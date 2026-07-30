import { UnderDevelopment } from "@/components/ui/under-development";

export default function StaffPage() {
  return (
    <UnderDevelopment
      title="Staff & Role Permissions"
      description="Manage team member accounts, roles, access permissions, and activity audit logs."
      moduleName="Staff Management"
      expectedFeatures={[
        "Staff User Account Creation & Status Toggle",
        "Role Assignment (Owner, Admin, Sales, Inventory, Content)",
        "Audit Log Inspection (Price changes, stock adjustments, deletions)",
        "Session Revocation Controls",
      ]}
    />
  );
}
