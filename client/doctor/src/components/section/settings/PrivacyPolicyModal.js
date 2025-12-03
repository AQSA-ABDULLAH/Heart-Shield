// PrivacyPolicyModal.jsx
// Usage:
// import PrivacyPolicyModal from './PrivacyPolicyModal';
// const [open, setOpen] = useState(false);
// <PrivacyPolicyModal isOpen={open} onClose={() => setOpen(false)} />

import React, { useEffect } from 'react';

export default function PrivacyPolicyModal({ isOpen = false, onClose = () => {} }) {
  // prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Privacy Policy</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1"
            aria-label="Close privacy policy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto text-sm text-gray-700 space-y-4">
           <p className="text-gray-600">This section explains our Privacy Policy and outlines how your personal information is collected, used, stored, and protected:</p>

          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Data Collection:</strong> We collect basic profile information (name, email, phone) that you provide when you register or update your profile.</li>
            <li><strong>Use of Data:</strong> Your data is used to provide and improve our services, send updates, and personalize your experience.</li>
            <li><strong>Data Sharing:</strong> We do not sell personal data. We may share information with trusted third-party service providers who help run the app (e.g., email, analytics).</li>
            <li><strong>Data Retention:</strong> We retain account data for as long as your account exists and for a reasonable period afterward for legal and operational needs.</li>
            <li><strong>Security:</strong> We use administrative, technical, and physical safeguards to protect user information, but no system is 100% secure.</li>
            <li><strong>User Rights:</strong> You can request access, correction, or deletion of your personal data. Contact support for assistance.</li>
            <li><strong>Cookies & Tracking:</strong> We use cookies and similar technologies for session management and analytics. You can disable cookies in your browser, but some features may stop working.</li>
            <li><strong>Children:</strong> Our services are not intended for children under 18. If we learn we collected data from a child without consent, we will take steps to delete it.</li>
            <li><strong>Changes to Policy:</strong> We may update this policy from time to time. We will notify users through the app or email when significant changes occur.</li>
            <li><strong>Contact:</strong> For questions or data requests, reach out to <code>heartshield9@gmail.com</code> (replace with your support address).</li>
          </ul>

        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
