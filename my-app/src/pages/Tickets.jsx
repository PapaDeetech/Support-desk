import {useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import Spinner from './components/Spinner'
import {toast} from 'react-toastify'
import BackButton from './components/BackButton'
import {getTickets, reset} from '../features/ticket/ticketSlice'
import TicketItem from './components/Ticketitem'

const Tickets = () => {
    const {tickets, isLoading, isSuccess, isError, message} = useSelector((state) => state.tickets)
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    const dispatch = useDispatch()

    useEffect(() => {
        return () => {
            if(isSuccess)
            dispatch(reset())
        }
    }, [dispatch, isSuccess])

    useEffect(() => {
        dispatch(getTickets())
    }, [dispatch])

    if (isLoading) {
        return <Spinner />
    }

  return (
    <>
    <BackButton url='/' />
    <h1>Tickets</h1>

    <div className="tickets">
        <div className="ticket-headings">
            <div>Date</div>
            <div>Product</div>
            <div>Status</div>
            <div></div>
        </div>
    {
        safeTickets.map((ticket) => (
            <TicketItem key={ticket._id} ticket={ticket} />
        ))
    }
     </div>
    </>
  )
}

export default Tickets