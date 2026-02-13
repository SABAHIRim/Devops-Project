import { useEffect, useRef, useState } from "react";

const API_CHAT = "/api/node/api/chat/messages";
const API_ME = "/api/node/auth/me";

export default function TeamChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState(null);
  const boxRef = useRef(null);

  const token = localStorage.getItem("token");

  // =========================
  // Récupérer l'utilisateur connecté
  // =========================
  const loadMe = async () => {
    try {
      const res = await fetch(API_ME, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMe(data);
    } catch (err) {
      console.error("Erreur loadMe", err);
    }
  };

  // =========================
  // Charger les messages
  // =========================
  const loadMessages = async () => {
    try {
      const res = await fetch(API_CHAT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Erreur loadMessages", err);
    }
  };

  // =========================
  // Initialisation
  // =========================
  useEffect(() => {
    if (!token) return;

    loadMe();
    loadMessages();

    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  // =========================
  // Auto scroll
  // =========================
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  // =========================
  // Envoyer message
  // =========================
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await fetch(API_CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        console.error("Erreur envoi message");
        return;
      }

      setText("");
      loadMessages();
    } catch (err) {
      console.error("Erreur sendMessage", err);
    }
  };

  // =========================
  // Supprimer message
  // =========================
  const deleteMessage = async (id) => {
    try {
      await fetch(`${API_CHAT}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      loadMessages();
    } catch (err) {
      console.error("Erreur deleteMessage", err);
    }
  };

  // =========================
  // Déconnexion
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  if (!me) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h3 style={styles.title}>💬 Chat Collaboratif</h3>

        <div style={styles.userRow}>
          <span>
            Connecté : <b>{me.username}</b>
          </span>
          <button onClick={logout} style={styles.logout}>
            Déconnexion
          </button>
        </div>

        <div ref={boxRef} style={styles.messages}>
          {messages.map((m) => (
            <div key={m.id} style={styles.message}>
              <div style={styles.meta}>
                <b>{m.username}</b> •{" "}
                {new Date(m.created_at).toLocaleString()}
              </div>

              <div>{m.content}</div>

              {m.user_id === me.id && (
                <button
                  onClick={() => deleteMessage(m.id)}
                  style={styles.delete}
                >
                  Supprimer
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={styles.inputRow}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écris un message..."
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} style={styles.button}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  page: {
    minHeight: "100vh",
    background: "#1e1e1e",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 380,
    background: "#111",
    borderRadius: 16,
    padding: 16,
    color: "#fff",
    boxShadow: "0 0 30px rgba(0,0,0,0.7)",
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
  },
  userRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 14,
  },
  logout: {
    background: "none",
    border: "none",
    color: "#ff4d4d",
    cursor: "pointer",
  },
  messages: {
    height: 320,
    overflowY: "auto",
    background: "#0c0c0c",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  message: {
    background: "#1e1e1e",
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  delete: {
    marginTop: 6,
    background: "none",
    border: "none",
    color: "#ff4d4d",
    cursor: "pointer",
    fontSize: 12,
  },
  inputRow: {
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    border: "none",
    background: "#2a2a2a",
    color: "#fff",
  },
  button: {
    background: "#6c63ff",
    border: "none",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },
};
