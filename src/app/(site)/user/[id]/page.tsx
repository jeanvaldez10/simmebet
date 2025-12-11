import Profile from "@/app/(site)/profile/main-page";
import React from "react";

const PublicProfilePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const userName = await params;

  return <Profile type="public" id={userName.id} />;
};

export default PublicProfilePage;
