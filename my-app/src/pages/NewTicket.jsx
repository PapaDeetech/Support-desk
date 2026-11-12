import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createTicket, reset } from '../features/ticket/ticketSlice'
import Spinner from './components/Spinner'
import BackButton from './components/BackButton'

const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024

const NewTicket = () => {
  const { user } = useSelector((state) => state.auth)

  const {
    isLoading,
    isError,
    isSuccess,
    message
  } = useSelector((state) => state.tickets)

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [product, setProduct] = useState('Iphone')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState([])

  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Handle success and error messages
  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess) {
      dispatch(reset())
      navigate('/tickets')
    }

    return () => {
      dispatch(reset())
    }
  }, [dispatch, isError, isSuccess, message, navigate])

  // Select and validate images
  const onImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files)

    if (attachments.length + selectedFiles.length > MAX_FILES) {
      toast.error(`You can upload a maximum of ${MAX_FILES} pictures.`)
      e.target.value = ''
      return
    }

    const validFiles = []

    for (const file of selectedFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name}: Only JPG, PNG and WEBP images are allowed.`)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: Image must not exceed 5MB.`)
        continue
      }

      validFiles.push(file)
    }

    setAttachments((prev) => [...prev, ...validFiles])
    e.target.value = ''
  }

  // Remove selected image
  const removeImage = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Submit ticket
  const onSubmit = (e) => {
    e.preventDefault()

    if (!description.trim()) {
      toast.error('Please enter a description.')
      return
    }

    dispatch(createTicket({
      product,
      description,
      attachments
    }))
  }

  // Create and clean up preview URLs
  const [imagePreviews, setImagePreviews] = useState([])

  useEffect(() => {
    const previews = attachments.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }))

    setImagePreviews(previews)

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [attachments])

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
              placeholder="Describe the problem you are experiencing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label htmlFor="attachments">
              Attach Pictures (Optional)
            </label>

            <p className="upload-description">
              Upload screenshots or pictures that help explain the issue.
              Maximum 3 pictures, 5MB each.
            </p>

            <input
              type="file"
              id="attachments"
              className="form-control"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onImageChange}
              disabled={attachments.length >= MAX_FILES}
            />

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="attachment-preview">
                {imagePreviews.map((preview, index) => (
                  <div className="attachment-item" key={`${preview.name}-${index}`}>
                    <img
                      src={preview.url}
                      alt={`Attachment ${index + 1}`}
                    />

                    <button
                      type="button"
                      className="remove-attachment"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove ${preview.name}`}
                    >
                      Remove
                    </button>

                    <small>{preview.name}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="btn btn-block"
              disabled={isLoading}
            >
              Submit
            </button>
          </div>

        </form>
      </section>
    </>
  )
}

export default NewTicket