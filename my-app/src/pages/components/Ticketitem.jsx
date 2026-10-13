import {Link} from 'react-router-dom'


const Ticketitem = ({ ticket }) => {
  return (
    <div className="ticket">
     <div>{new Date(ticket.createdAt).toLocaleString('en-US')}</div>
     <div>{ticket.product}</div>
     <div className={`status status-${ticket.status}`}>{ticket.status}</div>
    
      <Link to={`/ticket/${ticket._id}`} className='btn btn-reverse btn-sm'>
      View Details
      </Link>

    </div>
  )
}

export default Ticketitem