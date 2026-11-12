import { useSelector } from 'react-redux';

const NoteItem = ({ note }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div
      className="note"
      style={{
        backgroundColor: note.isStaff ? 'rgba(0,0,0,0.7)' : '#fff',
        color: note.isStaff ? '#fff' : '#000',
      }}
    >
      <h4>
        Note from{' '}
        {note.isStaff ? (
          <span>Staff</span>
        ) : (
          <span>{user?.name || 'User'}</span>
        )}
      </h4>

      <p>{note.text}</p>

      {/* Display attached images */}
      {note.attachments?.length > 0 && (
        <div className="note-attachments">
          {note.attachments.map((attachment, index) => (
            <a
              key={attachment.public_id || index}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="note-attachment-link"
            >
              <img
                src={attachment.url}
                alt={attachment.originalName || `Note attachment ${index + 1}`}
                className="note-attachment-image"
              />
            </a>
          ))}
        </div>
      )}

      <div className="note-date">
        {new Date(note.createdAt).toLocaleString('en-US')}
      </div>
    </div>
  );
};

export default NoteItem;