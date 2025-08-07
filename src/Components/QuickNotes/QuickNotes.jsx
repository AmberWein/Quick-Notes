import { useState, useRef } from "react";
import "./QuickNotes.css";

function QuickNotes() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const textareaRef = useRef(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const formatDate = (date) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();

    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${month} ${day}${getOrdinalSuffix(day)} ${displayHours}:${minutes} ${ampm}`;
  };

  const addNote = () => {
    if (noteContent.trim() === "") return;

    const newNote = {
      id: Date.now(),
      title: noteTitle.trim() || null,
      content: noteContent,
      createdAt: new Date(),
      updatedAt: null,
    };

    setNotes([...notes, newNote]);
    setNoteContent("");
    setNoteTitle("");
  };

  const deleteNote = (noteId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete your note?");
    if (confirmDelete) {
      setNotes(notes.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) setSelectedNote(null);
    }
  };

  const handleContentChange = (e) => {
    setNoteContent(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const openNote = (note) => {
    setSelectedNote({...note});
  };

  const closeModal = () => {
    setSelectedNote(null);
  };

  const handleModalChange = (field, value) => {
    setSelectedNote(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveNoteChanges = () => {
    if (!selectedNote.content.trim()) return;

    setNotes(notes.map(note => 
      note.id === selectedNote.id 
      ? {...selectedNote, updatedAt: new Date()} 
      : note
    ));
    setSelectedNote(null);
  };

  return (
    <div className="QuickNotes-container">
      <h1>QuickNotes</h1>

      <div className="add-new-note-container">
        <h3>Add new note</h3>
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Note title (optional)"
        />
        <textarea
          ref={textareaRef}
          value={noteContent}
          onChange={handleContentChange}
          placeholder="Write your note here..."
          rows={1}
          style={{overflow: "hidden"}}
        />
        <button onClick={addNote}>Add</button>
      </div>

      <div className="notes-container">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            onClick={() => openNote(note)}
          >
            {note.title && <h4>{note.title}</h4>}
            <div className="note-content">{note.content}</div>
            <div className="note-footer">
              <span>
                Created: {formatDate(new Date(note.createdAt))}
                {note.updatedAt && (
                  <> | Updated: {formatDate(new Date(note.updatedAt))}</>
                )}
              </span>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && <div>No notes yet, add your first note.</div>}

      {selectedNote && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={selectedNote.title || ""}
              onChange={(e) => handleModalChange("title", e.target.value)}
              placeholder="Note title (optional)"
            />
            <textarea
              value={selectedNote.content}
              onChange={(e) => handleModalChange("content", e.target.value)}
              rows={5}
              style={{width: "100%"}}
            />
            <div className="modal-dates">
              <small>Created: {formatDate(new Date(selectedNote.createdAt))}</small>
              {selectedNote.updatedAt && (
                <small> | Updated: {formatDate(new Date(selectedNote.updatedAt))}</small>
              )}
            </div>
            <button onClick={saveNoteChanges}>Save</button>
            <button onClick={closeModal} style={{marginLeft:"10px"}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickNotes;