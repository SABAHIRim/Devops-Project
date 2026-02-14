import { useEffect, useState } from "react";

const API = "/api/node/api/users";

export default function UserProfile({ userToken }) {
    const [profile, setProfile] = useState(null);
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState(null);
    const [allUsers, setAllUsers] = useState([]); // Pour la liste des membres
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ display_name: "", bio: "", avatar_url: "" });

    const headers = { 
        "Authorization": `Bearer ${userToken}`,
        "Content-Type": "application/json"
    };

    const loadData = async () => {
        try {
            const [pRes, aRes, sRes, uRes] = await Promise.all([
    fetch(`${API}/me/profile`, { headers }),
    fetch(`${API}/me/activity`, { headers }),
    fetch(`${API}/me/stats`, { headers }),
    fetch(`${API}`, { headers })
]);
            
            if (pRes.ok) {
                const pData = await pRes.json();
                setProfile(pData);
                setForm({ 
                    display_name: pData.display_name || "", 
                    bio: pData.bio || "", 
                    avatar_url: pData.avatar_url || "" 
                });
            }
            if (aRes.ok) setActivities(await aRes.json());
            if (sRes.ok) setStats(await sRes.json());
            if (uRes.ok) setAllUsers(await uRes.json());
        } catch (e) { console.error("Erreur de chargement", e); }
    };

    useEffect(() => { 
        if(userToken) loadData(); 
    }, [userToken]);

    // Applique le thème au chargement initial
    useEffect(() => {
        if (profile?.theme) {
            document.documentElement.setAttribute('data-theme', profile.theme);
        }
    }, [profile]);

    const handleSave = async () => {
        const res = await fetch(`${API}/me/profile`, {
            method: "PUT",
            headers,
            body: JSON.stringify(form)
        });
        if (res.ok) {
            setIsEditing(false);
            loadData();
        }
    };
const updatePref = async (key, value) => {
        const body = key === 'theme' ? { theme: value } : { timezone: value };
        const res = await fetch(`${API}/me/preferences`, {
            method: "PATCH", 
            headers, 
            body: JSON.stringify(body)
        });
        if (res.ok) loadData();
    };

    if (!profile) return <div style={styles.loading}>Chargement...</div>;
    const toggleTheme = async () => {
        const newTheme = profile.theme === "dark" ? "light" : "dark";
        try {
            const res = await fetch(`${API}/me/preferences`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ theme: newTheme })
            });
            if (res.ok) {
                document.documentElement.setAttribute('data-theme', newTheme);
                await loadData();
            }
        } catch (e) { console.error("Erreur changement thème", e); }
    };

    if (!profile) return <div style={styles.loading}>Chargement du profil...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <img 
                        src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=6c63ff&color=fff`} 
                        style={styles.avatar} 
                        alt="Avatar" 
                    />
                    <div style={{flex: 1}}>
                        <h2 style={styles.username}>{profile.display_name || profile.username}</h2>
                        <p style={styles.email}>{profile.email}</p>
                    </div>
                    <button onClick={() => setIsEditing(!isEditing)} style={styles.btnSecondary}>
                        {isEditing ? "Annuler" : "Modifier"}
                    </button>
                </div>

                {isEditing ? (
                    <div style={styles.editSection}>
                        <input style={styles.input} placeholder="Nom d'affichage" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} />
                        <textarea style={{...styles.input, height: "80px"}} placeholder="Bio" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                        <input style={styles.input} placeholder="URL de l'avatar" value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} />
                        <label style={styles.label}>Fuseau horaire (Timezone)</label>
                        <select 
                            style={styles.input} 
                            value={profile.timezone || "UTC"} 
                            onChange={(e) => updatePref('timezone', e.target.value)}
                        >
                            <option value="UTC">UTC (Londres)</option>
                            <option value="Europe/Paris">Europe/Paris</option>
                            <option value="Africa/Casablanca">Casablanca</option>
                            <option value="America/New_York">New York</option>
                        </select>
                        <button onClick={handleSave} style={styles.btnPrimary}>Sauvegarder</button>
                        <br /> <br />
                    </div>

                ) : (
                    <div style={styles.bioBox}>
                        <p style={{margin: 0}}>{profile.bio || "Aucune bio définie."}</p>
                    </div>
                )}

                <div style={styles.statsRow}>
                    <div style={styles.statBox}>
                        <span style={styles.statLabel}>Tâches</span>
                        <strong style={styles.statVal}>{stats?.tasks_completed || 0}</strong>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statLabel}>Messages</span>
                        <strong style={styles.statVal}>{stats?.total_messages || 0}</strong>
                    </div>
                    <div style={{...styles.statBox, cursor: 'pointer', border: profile.theme === 'light' ? '1px solid #6c63ff' : '1px solid transparent'}} onClick={toggleTheme}>
                        <span style={styles.statLabel}>Thème</span>
                        <strong style={{...styles.statVal, color: '#6c63ff'}}>{profile.theme?.toUpperCase() || "DARK"}</strong>
                    </div>
                </div>

                <h4 style={styles.sectionTitle}>🕒 Activité récente</h4>
                <div style={styles.activityList}>
                    {activities.length > 0 ? activities.map((act, i) => (
                        <div key={i} style={styles.activityItem}>
                            <span style={{color: '#6c63ff'}}>●</span> 
                            <span style={{color: "var(--text-color)"}}>{act.description}</span>
                            <small style={styles.activityDate}>{new Date(act.created_at).toLocaleDateString()}</small>
                        </div>
                    )) : <p style={styles.emptyText}>Aucune activité trouvée.</p>}
                </div>
                 {/* FEATURE: Liste des membres */}
                <h4 style={styles.sectionTitle}>👥 Membres de l'équipe ({allUsers.length})</h4>
                <div style={styles.userList}>
                    {allUsers.map(u => (
                        <div key={u.id} style={styles.userRow}>
                            <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}`} style={{
        width: "100px",      // Force une largeur fixe
        height: "100px",     // Force une hauteur fixe
        borderRadius: "50%", // Garde l'aspect circulaire
        objectFit: "cover",  // Évite que l'image soit déformée
        border: "3px solid #6c63ff"
    }} 
    alt="Avatar" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 20px" },
    card: { 
        border: "1px solid var(--border-color)", 
        width: "100%", 
        maxWidth: "450px", 
        background: "var(--card-bg)", 
        borderRadius: "24px", 
        padding: "30px", 
        color: "var(--text-color)", 
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        transition: "all 0.3s ease"
    },
    header: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "25px" },
    avatar: { width: "80px", height: "80px", borderRadius: "50%", border: "3px solid #6c63ff", objectFit: "cover" },
    username: { margin: 0, fontSize: "1.5rem", color: "var(--text-color)" },
    email: { margin: 0, opacity: 0.6, fontSize: "14px", color: "var(--text-color)" },
    bioBox: { 
        background: "var(--input-bg)", 
        padding: "15px", 
        borderRadius: "12px", 
        fontSize: "14px", 
        marginBottom: "25px", 
        border: "1px solid var(--border-color)",
        color: "var(--text-color)"
    },
    statsRow: { display: "flex", gap: "12px", marginBottom: "30px" },
    statBox: { 
        flex: 1, 
        background: "var(--input-bg)", 
        padding: "15px", 
        borderRadius: "15px", 
        textAlign: "center", 
        display: "flex", 
        flexDirection: "column",
        color: "var(--text-color)",
        border: "1px solid var(--border-color)"
    },
    statLabel: { fontSize: "10px", textTransform: "uppercase", opacity: 0.5 },
    statVal: { fontSize: "18px" },
    sectionTitle: { 
        fontSize: "14px", 
        opacity: 0.8, 
        marginBottom: "15px", 
        borderBottom: "1px solid var(--border-color)", 
        paddingBottom: "10px",
        color: "var(--text-color)"
    },
    activityList: { maxHeight: "160px", overflowY: "auto" },
    activityItem: { 
        padding: "10px 0", 
        borderBottom: "1px solid var(--border-color)", 
        fontSize: "13px", 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center"
    },
    activityDate: { opacity: 0.4, color: "var(--text-color)" },
    input: { 
        width: "100%", 
        background: "var(--input-bg)", 
        border: "1px solid var(--border-color)", 
        color: "var(--text-color)", 
        padding: "12px", 
        borderRadius: "10px", 
        marginBottom: "12px", 
        boxSizing: "border-box" 
    },
    btnPrimary: { background: "#6c63ff", color: "white", border: "none", padding: "14px", borderRadius: "10px", cursor: "pointer", width: "100%", fontWeight: "bold" },
    btnSecondary: { 
        background: "var(--btn-secondary-bg)", 
        color: "var(--text-color)", 
        border: "1px solid var(--border-color)", 
        padding: "8px 15px", 
        borderRadius: "8px", 
        cursor: "pointer", 
        fontSize: "12px",
        transition: "all 0.2s ease"
    },
    loading: { color: "var(--text-color)", textAlign: "center", padding: "100px" },
    emptyText: { opacity: 0.3, textAlign: "center", fontSize: "12px", color: "var(--text-color)" }
};