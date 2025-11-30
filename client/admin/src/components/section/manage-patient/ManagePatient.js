import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/get-patients");
      setPatients(res.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle patient deletion with confirmation
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this patient?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/user/delete-patient/${id}`);
          Swal.fire('Deleted!', 'Patient has been deleted.', 'success');
          fetchPatients(); // Refresh the list
        } catch (error) {
          console.error('Error deleting patient:', error);
          Swal.fire('Error!', 'Something went wrong.', 'error');
        }
      }
    });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Patient Management</h1>

      {loading ? (
        <p>Loading patients...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Patient Email</th>
                <th className="px-6 py-4">Age</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td className="px-6 py-4">{patient.fullName}</td>
                  <td className="px-6 py-4">{patient.email}</td>
                  <td className="px-6 py-4">{patient.age}</td>
                  <td className="px-6 py-4">
                    <button
                      className="bg-[#3b0a00] text-white px-4 py-1 rounded hover:bg-red-900"
                      onClick={() => handleDelete(patient._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;

