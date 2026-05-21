import {useState} from 'react'
import { Loader2Icon, LogOutIcon, LogInIcon } from 'lucide-react'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

const CheckInButton = ({todayRecord, onAction}) => {

  const [loading, setLoading] = useState(false)

  const handleAttendance = async ()=>{
    setLoading(true)
    // setTimeout(()=>{
    //   setLoading(false)
    //   onAction()
    // },1000)
    try {
      await api.post('/attendance')
      onAction()
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message)
    }
    setLoading(false);
  }

  if(todayRecord?.checkOut){
    return (
      <div className='flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-200'>
        <h1 className='text-lg font-bold text-sky-900'>Work Day Completed</h1>
        <p className='text-slate-500 text-sm mt-1'>Great job! See you tomorrow</p>
      </div>
    )
  }

  const isCheckedIn = !!todayRecord?.checkIn;

  return (
    <div className='absolute bottom-4 right-4 flex flex-col z-1'>
      <button 
        onClick={handleAttendance} disabled={loading}
        className={`w-full max-w-xs flex justify-between items-center gap-8 p-4 rounded-xl bg-linear-to-br text-white ${isCheckedIn ? "from-slate-700 to-slate-900" : "from-indigo-600 to-indigo-700"}`}>
        {loading ? <Loader2Icon className='size-7 animate-spin' /> : isCheckedIn? <LogOutIcon className='size-7' /> : <LogInIcon className='size-7' />}
        <div className='relative flex flex-col items-center text-center'>
          <h2 className='text-lg font-medium mb-1'>
            {loading ? "Processing..." : isCheckedIn ? "Clock Out" : "Clock In"}
          </h2>
          <p className='text-xs opacity-80'>
            {isCheckedIn ? "Click to end your shift" : "Start your work day"}
          </p>
        </div>
      </button>
    </div>
  )
}

export default CheckInButton
