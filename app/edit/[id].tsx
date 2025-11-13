import React from "react";
import { useRouter } from "next/router";

export default function EditById() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <main>
      <h1>Edit item {id}</h1>
      {/* Edit form / editor here */}
    </main>
  );
}
