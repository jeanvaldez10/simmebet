"use client";

import { useState } from "react";
import AccessDenied from "./access-denied";

const AccessParent = () => {
  const [open, setOpen] = useState(
    !localStorage.getItem("access") ? true : false
  );

  return <AccessDenied open={open} setOpen={setOpen} />;
};

export default AccessParent;
