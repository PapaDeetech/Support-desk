import {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify';
import {createTicket, reset} from '../features/ticket/ticketSlice';
import Spinner from './components/Spinner';
import BackButton from './components/BackButton';


const NewTicket = () => {
  const {user} = useSelector((state) => state.auth)
  const {isLoading, isError, isSuccess, message} = useSelector((state) => state.tickets)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [product, setProduct] = useState('Iphone')
  const [description, setDescription] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()


  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
    if (isSuccess) {
      dispatch(reset())
      navigate('/tickets')
    }

    dispatch(reset())
  }, [dispatch, isError, isSuccess, message, navigate])

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(createTicket({product, description}))

  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
    <BackButton url='/' />

    <section className="heading">
      <h1>Create New Ticket</h1>
      <p>Please fill out the form below</p>
    </section>

    <section className="form">
      <form onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="name">Customer Name</label>
        <input
          type="text"
          id="name"
          className="form-control"
          value={name}
          disabled
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Customer Email</label>
        <input
          type="email"
          id="email"
          className="form-control"
          value={email}
          disabled
        />
      </div>

      <div className="form-group">
        <label htmlFor="product">Product</label>
        <select
          id="product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        >
          <option value="Iphone">IPhone</option>
          <option value="Hp Elitebook">Hp Elitebook</option>
          <option value="Macbook Pro">Macbook Pro</option>
          <option value="Dell Inspiron">Dell Inspiron</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          className="form-control"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <button className="btn btn-block">Submit</button>
      </div>

    </form>
    </section>
    </>
  )
}

export default NewTicket