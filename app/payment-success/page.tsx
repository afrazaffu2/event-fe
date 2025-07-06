"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, createApiRequestOptions } from "@/lib/api";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Processing your registration...");

  useEffect(() => {
    async function handleRegistration() {
      // Get registration data from localStorage
      const regDataRaw = localStorage.getItem("pendingRegistration");
      if (!regDataRaw) {
        setMessage("No registration data found. Redirecting to home...");
        setTimeout(() => router.push("/"), 2000);
        return;
      }
      const regData = JSON.parse(regDataRaw);
      try {
        // Send registration data to backend (Django)
        const response = await fetch(
          `${API_ENDPOINTS.EVENTS}/${regData.event_id}/register`,
          createApiRequestOptions("POST", regData)
        );
        if (!response.ok) throw new Error("Registration failed");
        setMessage("Payment successful! Redirecting to event...");
        // Clean up
        localStorage.removeItem("pendingRegistration");
        setTimeout(() => {
          router.push(`/events/${regData.slug}`);
        }, 2000);
      } catch (err) {
        setMessage(
          "Registration failed after payment. Please contact support or try again."
        );
      }
    }
    handleRegistration();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white rounded-xl shadow-lg p-8 mt-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Success</h1>
        <p className="text-lg text-gray-700">{message}</p>
      </div>
    </div>
  );
} 