import { ProfilePageContent } from "@/lib/profile/feature";
import { ProtectedPageWrapper } from "@/lib/auth/feature/protected-page-wrapper";

export default function Profile() {
  return (
    <ProtectedPageWrapper pageName="Profile">
      <ProfilePageContent />
    </ProtectedPageWrapper>
  );
}
