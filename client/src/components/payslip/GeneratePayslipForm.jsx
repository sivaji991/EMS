import {useState, useEffect, useCallback} from 'react'
import { Plus, X,Loader2 } from 'lucide-react'

const GeneratePayslipForm = ({employees, onSuccess}) => {

  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if(!isOpen) return (
    <button onClick={()=>setIsOpen(true)} className='btn-primary flex items-center gap-2'>
      <Plus className='w-4 h-4' />
      Generate Payslip
    </button>
  )

  const handleSubmit = async (e)=>{
    e.preventDefault();
  }

  return (
    <div className='fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='card max-w-lg w-full p-6 animate-slide-up'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-lg font-bold text-slate-900'>Generate Monthly Payslip</h3>
          <button
           onClick={()=>setIsOpen(false)} className='text-slate-400 hover:text-slate-600 p-1'>
              <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* select employee */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              Employee
            </label>
            <select name="employeeId" required>
              {employees.map((e)=>(
                <option key={e._id || e.id} value={e._id || e.id}>
                  {e.firstName} {e.lastName} ({e.position})
                </option>
              ))}
            </select>
          </div>

          {/* select month & year */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
              Month
            </label>
            <select name="month">
              {Array.from({length:12}, (_, i)=> i + 1).map((m)=>(
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
              Year
            </label>
              <input type="number" name='year' defaultValue={new Date().getFullYear()} />
            </div>
          </div>

          {/* Basic Salary */}
          <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
              Basic Salary
            </label>
              <input type="number" name='basicSalary' required placeholder='5000' />
          </div>

          {/* Allowances & Deductions */}
          <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Allowances
                </label>
                <input type="number" name='allowances' defaultValue="0" />
            </div>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Deductions
                </label>
                <input type="number" name='deductions' defaultValue="0" />
            </div>
          </div>

          {/* buttons */}
          <div className='flex justify-end gap-3 pt-2'>
            <button 
              type='button'
              onClick={()=>setIsOpen(false)}
              className='btn-secondary'>
              Cancel
            </button>
            <button 
              type='submit'
              disabled={loading}
              className='btn-primary flex items-center'>
                {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin'/> }
              Generate
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default GeneratePayslipForm
