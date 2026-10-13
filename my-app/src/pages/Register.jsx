import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {FaUser} from 'react-icons/fa'
import {toast} from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import { register, reset} from '../features/auth/authSlice'
import Spinner from './components/Spinner'


function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  })

  const {name, email, password, password2} = formData

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {user, isLoading, isError, isSuccess, message} = useSelector((state) => state.auth)

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    // Redirect when logged in
    if (isSuccess || user) {
      navigate('/')
      toast.success('User registered successfully')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])
  
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (password !== password2) {
      toast.error('Passwords Mismatch')
    } else {
      const userData = {
        name,
        email,
        password
      }
      dispatch(register(userData))
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
    <section className='heading'>
      <h1>
        <FaUser /> Register
      </h1>
      <p>Please create an account</p>
    </section>

    <section className='form'>
      <form onSubmit={onSubmit}>
        <div className='form-group'>
          <input type='text' 
          className='form-control'
          id='name' 
          name='name' 
          value={name} 
          placeholder='Please enter your name' 
          onChange={onChange}
          />

          <input type= 'email'
          className= 'form-control'
          id= 'email'
          name= 'email'
          value= {email}
          placeholder= 'Please enter your email'
          onChange= {onChange}
          />

          <input type= 'password'
          className= 'form-control'
          id= 'password'
          name= 'password'
          value= {password}
          placeholder= 'Please enter your password'
          onChange= {onChange}
          />

          <input type= 'password'
          className= 'form-control'
          id= 'password2'
          name= 'password2'
          value= {password2}
          placeholder= 'Please confirm your password'
          onChange= {onChange}
          />
        </div>

        <div className="form-group">
          <button type='submit' className='btn btn-block'>Submit</button>
        </div>
      </form>
    </section>
    </>
  )
}

export default Register