import { useState, useRef, useEffect } from "react";
import "./QuickNotes.css";

function QuickNotes() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("Personal"); // NEW: Category state
  const textareaRef = useRef(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // define categories with colors
  const categories = {
    "Personal": { color: "#e3f2fd", borderColor: "#1976d2" },
    "Work": { color: "#f3e5f5", borderColor: "#7b1fa2" },
    "Study": { color: "#e8f5e8", borderColor: "#388e3c" },
    "Health": { color: "#fff3e0", borderColor: "#f57c00" },
    "Finance": { color: "#fce4ec", borderColor: "#c2185b" },
    "Ideas": { color: "#f1f8e9", borderColor: "#689f38" },
    "Shopping": { color: "#e0f2f1", borderColor: "#00796b" }
  };

  // load notes from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("quick-notes");
    if (stored) {
      try {
        const parsedNotes = JSON.parse(stored);
        // convert date strings back to Date objects
        const notesWithDates = parsedNotes.map(note => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: note.updatedAt ? new Date(note.updatedAt) : null,
          category: note.category || "Personal" // default category for old notes
        }));
        setNotes(notesWithDates);
      } catch (error) {
        console.error("error loading notes from localStorage:", error);
        setNotes([]);
      }
    }
    setIsInitialLoad(false); // initial load is complete
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem("quick-notes", JSON.stringify(notes));
    }
  }, [notes, isInitialLoad]);

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

  const handleContentChange = (e) => {
    setNoteContent(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const addNote = () => {
    if (noteContent.trim() === "") return;

    const newNote = {
      id: Date.now(),
      title: noteTitle.trim() || null,
      content: noteContent,
      category: noteCategory,
      createdAt: new Date(),
      updatedAt: null,
    };

    setNotes([...notes, newNote]);
    setNoteContent("");
    setNoteTitle("");
    setNoteCategory("Personal");
  };

  const deleteNote = (noteId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your note?"
    );
    if (confirmDelete) {
      setNotes(notes.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) setSelectedNote(null);
    }
  };

  const openNote = (note) => {
    setSelectedNote({ ...note });
  };

  const closeModal = () => {
    setSelectedNote(null);
  };

  const handleModalChange = (field, value) => {
    setSelectedNote((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveNoteChanges = () => {
    if (!selectedNote.content.trim()) return;

    setNotes(
      notes.map((note) =>
        note.id === selectedNote.id
          ? { ...selectedNote, updatedAt: new Date() }
          : note
      )
    );
    setSelectedNote(null);
  };

  return (
    <div className="QuickNotes-container">
      <h1>QuickNotes</h1>

      <div className="add-new-note-container">
        <h3>Add new note</h3>
        <select
          value={noteCategory}
          onChange={(e) => setNoteCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '10px',
            fontSize: '16px'
          }}
        >
          {Object.keys(categories).map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

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
        />
        <button onClick={addNote}>Add</button>
      </div>

      <div className="notes-container">
        {notes.map((note) => {
          const categoryStyle = categories[note.category] || categories["Personal"];
          
          return (
            <div
              key={note.id}
              className="note-card"
              onClick={() => openNote(note)}
              style={{
                backgroundColor: categoryStyle.color,
                borderLeft: `4px solid ${categoryStyle.borderColor}`
              }}
            >
              <div 
                className="category-badge"
                style={{
                  display: 'inline-block',
                  backgroundColor: categoryStyle.borderColor,
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}
              >
                {note.category}
              </div>

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
          );
        })}
      </div>

      {notes.length === 0 && <div>No notes yet, add your first note.</div>}

      {selectedNote && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            <select
              value={selectedNote.category || "Personal"}
              onChange={(e) => handleModalChange("category", e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '15px',
                fontSize: '16px'
              }}
            >
              {Object.keys(categories).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

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
              style={{ width: "100%" }}
            />
            <div className="modal-dates">
              <small>
                Created: {formatDate(new Date(selectedNote.createdAt))}
              </small>
              {selectedNote.updatedAt && (
                <small>
                  {" "}
                  | Updated: {formatDate(new Date(selectedNote.updatedAt))}
                </small>
              )}
            </div>
            <button onClick={saveNoteChanges}>Save</button>
            <button onClick={closeModal} style={{ marginLeft: "10px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickNotes;