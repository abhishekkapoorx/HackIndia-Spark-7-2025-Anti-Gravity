"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    
       <UserProfile
        path="/user-profile" />

      
  );
}
