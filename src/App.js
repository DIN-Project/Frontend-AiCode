import { useState, useEffect } from 'react';
import './App.css';


function App() {
  const [input, setInput] = useState("")
  const [sessions, setSessions] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Saves sessions data to local storage that it can be viewed after refreshing or coming back to the site
    if (initialized) {
     localStorage.setItem('chatSessions', JSON.stringify(sessions));
   }
 }, [sessions, initialized]);

  useEffect(() => {
    // Get sessions data when the page is opened
    const storedSessions = JSON.parse(localStorage.getItem('chatSessions')) || [];
    setSessions(storedSessions);
    setInitialized(true);
  }, []);


  const handleSend = async () => {
    try {
      //Put the input and encode it so we can ask and receive the answer
      const url = `http://localhost:5249/OpenAi/CheckCode?text=${encodeURIComponent(input)}`;
      const response = await fetch(url, {
        method: 'POST'
      });

      if (!response.ok) {
        // If the response status is not OK, handle the error
        const errorMessage = await response.text();
        throw new Error(`Server responded with an error: ${errorMessage}`);
      }

      //Set response to result and set input to placeholder
      const result = await response.text();
      setInput('');


      // Update the active session with a new message
      const newMessage = { text: result, isBot: true };
      const updatedSessions = [...sessions];

      if (activeChat !== null) {
        updatedSessions[activeChat].messages.push({ text: input, isBot: false }, newMessage);
      } else {
        // If there's no active session, start a new session
        updatedSessions.push({
          isActive: true,
          messages: [{ text: input, isBot: false }, newMessage],
        });
        setActiveChat(updatedSessions.length - 1);
      }

      setSessions(updatedSessions);

    } catch (error) {
      console.error(error.message);
    }
  };

  const switchSession = (index) => {
  setActiveChat(index);
  };

  const startNewSession = () => {
    const updatedSessions = sessions.map(session => ({ ...session, isActive: false }));
    updatedSessions.push({ isActive: true, messages: [] });
    setActiveChat(updatedSessions.length - 1);
    setSessions(updatedSessions);
  };

  const deleteSession = (index) => {
    const updatedSessions = [...sessions];
    updatedSessions.splice(index, 1);
    setSessions(updatedSessions);
    setActiveChat(null); // After deletion reset active chat
  };

  return (
  <div className="Main">
    <div className="sidebar">
      <div className="chatButtons">
        <button className="newSession" onClick={startNewSession}>New Session</button>
        {sessions.map((session, index) => (
          <div key={index} className="chatButtonContainer">
            <button className={`chatButton ${index === activeChat ? 'active' : ''}`} onClick={() => switchSession(index)}>
              Chat {index + 1}
            </button>
            <button className="deleteButton" onClick={() => deleteSession(index)}>
              Delete
            </button>
        </div>
        ))}
      </div>
    </div>
    <div className="App">
      <div className="chats">
        {sessions.map((session, index) => (
          <div key={index} className={`session ${index === activeChat ? 'active' : ''}`}>
            {index === activeChat && session.messages.map((message, j) => (
              <div key={j} className={message.isBot ? "chat bot" : "chat user"}>
                <p style={{ fontWeight: 'bold' }}>{message.isBot ? "Ai Helper" : "You"}</p>
                <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
    <div className="chatFooter">
      <div className="input">
        <textarea
          placeholder='Place your code and question...'
          className="input-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="send" onClick={handleSend}>Send</button>
      </div>
    </div>
  </div>
  );
}

export default App;