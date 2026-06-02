import React, { useState } from 'react'
import { format } from 'date-fns'
import { Download, Trash2, Loader2 } from 'lucide-react'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

const PayslipList = ({ payslips, isAdmin, onDelete }) => {
  //Delete payslip
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this payslip?"
    );

    if (!confirmDelete) return;

    try {

      setDeleting(id);

      await api.delete(`/payslips/${id}`);

      toast.success(
        "Payslip deleted successfully"
      );

      onDelete();

    } catch (error) {

      toast.error(
        error.response?.data?.error ||
        error.message
      );

    } finally {

      setDeleting(null);

    }
  };
  return (
    <div className='card overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='table-modern'>
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}
              <th>Period</th>
              <th>Basic Salary</th>
              <th>Net Salary</th>
              <th className='text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payslips.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className='text-center py-12 text-slate-400'>
                  No payslips found!
                </td>
              </tr>
            ) : (
              payslips.map((payslip) => {
                const id = payslip._id || payslip.id;
                return (
                  <tr key={id}>
                    {isAdmin && (
                      <td className='text-slate-900'>
                        {payslip.employee?.firstName}
                        {" "}
                        {payslip.employee?.lastName}
                      </td>
                    )}

                    {/* period */}
                    <td className='text-slate-500'>
                      {format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy")}
                    </td>

                    {/* Basic Salary */}
                    <td className='text-slate-500'>
                      ${payslip.basicSalary?.toLocaleString()}
                    </td>

                    {/* Net Salary */}
                    <td className='font-medium text-slate-800'>
                      ${payslip.netSalary?.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className='text-center'>
                      <div className='flex items-center justify-center gap-2'>

                        {/* Download */}

                        {/* <button
                            onClick={()=>window.open(`/print/payslips/${id}`)}
                           className='inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors ring-1 ring-blue-600/10'>
                            <Download className='w-3 h-3 mr-1.5 ' />Download
                          </button> */}
                        <button
                          onClick={() => {
                            const payslipId = payslip.id || payslip._id;

                            console.log("BUTTON CLICKED");
                            console.log("PAYSLIP:", payslip);
                            console.log("PAYSLIP ID:", payslipId);

                            if (!payslipId) {
                              console.error("Payslip ID missing");
                              return;
                            }

                            window.open(`/print/payslips/${payslipId}`, "_blank");
                          }}
                          className='inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors ring-1 ring-blue-600/10'
                        >
                          <Download className='w-3 h-3 mr-1.5' />
                          Download
                        </button>

                        {/* Delete */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={
                              deleting === id
                            }
                            className='inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-rose-700 bg-blue-100 hover:bg-blue-200 transition-colors ring-1 ring-blue-600/10'>
                            {
                              deleting === id ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                              ) : (<Trash2 className='w-4 h-4' />)
                            }
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PayslipList
