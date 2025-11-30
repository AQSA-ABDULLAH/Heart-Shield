// src/components/ViewPrescriptionModal.js

import React from "react";

export default function ViewPrescriptionModal({ onClose, prescriptionText }) {
  // This stops the modal from closing when you click inside the content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Click outside to close
    >
      {/* Modal Content */}
      {/* MODIFICATION: Height ko 'auto' kiya takeh content ke mutabiq adjust ho */}
      <section
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative h-auto max-h-[80vh] flex flex-col"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">View Prescription</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-3xl font-light"
            onClick={onClose}
          >
            &times; {/* Close 'X' icon */}
          </button>
        </div>

        {/* Body - Conditional Content */}
        {/* MODIFICATION: min-height adjust ki aur overflow-y-auto add kiya */}
        <div className="mt-4 min-h-[200px] overflow-y-auto">
          {prescriptionText ? (
            // --- CASE 1: PRESCRIPTION EXISTS (Isko update kiya hai) ---
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Your doctor has provided the following prescription notes:
              </p>
              
              {/* <pre> tag text formatting (jaise new lines) ko preserve karta hai.
                'whitespace-pre-wrap' class text ko wrap karti hai agar woh line se bahar jaye.
              */}
              <pre className="bg-gray-50 p-4 rounded border border-gray-200 text-gray-700 font-sans whitespace-pre-wrap break-words">
                {prescriptionText}
              </pre>
            </div>
          ) : (
            // --- CASE 2: PRESCRIPTION IS PENDING (Yeh waise hi rahega) ---
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <svg
                className="w-16 h-16 text-yellow-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-700">
                Waiting for Doctor's Prescription
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Your doctor has not yet added prescription notes. Please check
                back later.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* MODIFICATION: mt-4 add kiya taake scrolling content se alag rahe */}
        <div className="flex justify-end pt-4 border-t mt-4">
          <button
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}