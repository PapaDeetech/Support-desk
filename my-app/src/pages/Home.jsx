import {Link} from 'react-router-dom'
import { FaQuestionCircle, FaTicketAlt } from 'react-icons/fa'
import {useSelector} from 'react-redux'

function Home() {
  const { user } = useSelector((state) => state.auth);

  console.log(user);
  return (
    <>
    <section className='heading'>
      <h1>Welcome</h1>
      <p>Please choose from the options below</p>
    </section>

    <Link to='/new-ticket' className='btn btn-reverse btn-block'>
        <FaQuestionCircle /> Create a New Ticket
    </Link>
    <Link to='/tickets' className='btn btn-reverse btn-block'>
        <FaTicketAlt /> View My Tickets
    </Link>
    </>
  )
}

export default Home