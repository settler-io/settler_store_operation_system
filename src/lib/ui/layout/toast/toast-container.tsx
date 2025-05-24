"use client";

import { ToastContainer } from "react-toastify";

export function ToastContainerProvider() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      closeButton={false}
      progressStyle={{
        background: "#99a0d5",
      }}
    ></ToastContainer>
  );
}
