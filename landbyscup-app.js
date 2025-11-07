import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
// Firebase (install firebase via npm/yarn before building)
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from 'firebase/auth';
// jsPDF (install jspdf and jspdf-autotable)
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyB0C2ecPKLnbIMzWuj9LHcZa_fa9c47GzM",
  authDomain: "landbys-cup-2288f.firebaseapp.com",
  databaseURL: "https://landbys-cup-2288f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "landbys-cup-2288f",
  storageBucket: "landbys-cup-2288f.firebasestorage.app",
  messagingSenderId: "369843977735",
  appId: "1:369843977735:web:57c142f411531280ed74a2",
  measurementId: "G-D424JY4H4Q"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export async function loginWithEmail(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
}
// --- Small SVG icon components ---
const CalendarIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const TargetIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const ClipboardIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const TrophyIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 14 20 16 20s4-1.25 5.03-1.79c.5-.23.97-.66.97-1.21v-2.34" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
const AwardIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
// --- Auth hook (wraps firebase onAuthStateChanged) ---
function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);
  return user;
}
// --- App root ---
function App() {
  const user = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [shooters, setShooters] = useState([]);
  const [scores, setScores] = useState([]);
  const [tab, setTab] = useState('results');
  useEffect(() => {
    const q = query(collection(db, 'competitions'), orderBy('date'));
    return onSnapshot(q, (snapshot) => setCompetitions(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);
  useEffect(() => {
    const q = query(collection(db, 'shooters'), orderBy('startNumber'));
    return onSnapshot(q, (snapshot) => setShooters(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);
  useEffect(() => {
    const q = query(collection(db, 'scores'));
    return onSnapshot(q, (snapshot) => setScores(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mt-6 border border-primary-200">
      <nav className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
        <TabBtn active={tab==='results'} onClick={() => setTab('results')} icon={<TrophyIcon />}>Resultatlistor</TabBtn>
        <TabBtn active={tab==='cup'} onClick={() => setTab('cup')} icon={<AwardIcon />}>Cupresultat</TabBtn>
        <TabBtn active={tab==='shooters'} onClick={() => setTab('shooters')} icon={<UsersIcon />}>Skyttar</TabBtn>
        {user && (
          <>
            <TabBtn active={tab==='competitions'} onClick={() => setTab('competitions')} icon={<CalendarIcon />}>Deltävlingar</TabBtn>
            <TabBtn active={tab==='scores'} onClick={() => setTab('scores')} icon={<ClipboardIcon />}>Registrera Poäng</TabBtn>
          </>
        )}
      </nav>
      {tab==='competitions' && user && <Competitions competitions={competitions} user={user} />}
      {tab==='shooters' && <Shooters shooters={shooters} user={user} />}
      {tab==='scores' && user && <Scores shooters={shooters} competitions={competitions} scores={scores} user={user} />}
      {tab==='results' && <Results shooters={shooters} scores={scores} competitions={competitions} />}
      {tab==='cup' && <CupResults shooters={shooters} scores={scores} competitions={competitions} />}
    </div>
  );
}
function TabBtn({ active, onClick, icon, children }) {
  return (
    <button
      className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 border ${active ? 'bg-primary-700 text-white border-primary-700 shadow-sm' : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100 hover:border-primary-300'}`}
      onClick={onClick}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{children}</span>
    </button>
  );
}
// (The full app continues — due to message-length limits the rest is appended below)

// --- Competitions component ---
function Competitions({ competitions, user }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [skiljemal, setSkiljemal] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSkiljemal, setEditSkiljemal] = useState([]);

  const stationer = [1,2,3,4,5,6,7];

  function toggleSkiljemal(station) {
    setSkiljemal(prev => prev.includes(station) ? prev.filter(s => s!==station) : (prev.length<3 ? [...prev, station] : prev));
  }
  function toggleEditSkiljemal(station) {
    setEditSkiljemal(prev => prev.includes(station) ? prev.filter(s => s!==station) : (prev.length<3 ? [...prev, station] : prev));
  }

  const addCompetition = async () => {
    if (!user) return alert('Du måste vara inloggad!');
    if (!name || !date || skiljemal.length===0) return alert('Fyll i namn, datum och minst 1 skiljemålsstation!');
    await addDoc(collection(db, 'competitions'), { name, date, skiljemal });
    setName(''); setDate(''); setSkiljemal([]);
  };

  const startEdit = (c) => {
    setEditId(c.id); setEditName(c.name); setEditDate(c.date); setEditSkiljemal(c.skiljemal || []);
  };
  const saveEdit = async () => {
    if (!user) return alert('Du måste vara inloggad!');
    if (!editName || !editDate || editSkiljemal.length===0) return alert('Fyll i namn, datum och minst 1 skiljemålsstation!');
    await updateDoc(doc(db, 'competitions', editId), { name: editName, date: editDate, skiljemal: editSkiljemal });
    setEditId(null); setEditName(''); setEditDate(''); setEditSkiljemal([]);
  };
  const cancelEdit = () => { setEditId(null); setEditName(''); setEditDate(''); setEditSkiljemal([]); };
  const removeCompetition = async (id) => { if (!user) return alert('Du måste vara inloggad!'); if (!window.confirm('Ta bort deltävlingen?')) return; await deleteDoc(doc(db, 'competitions', id)); };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-6 text-primary-800 flex items-center gap-3"><CalendarIcon className="w-6 h-6"/> Deltävlingar</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Namn" className="border border-primary-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border border-primary-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
        <div className="flex gap-3 items-center mb-2">
          <span className="font-medium text-primary-700">Skiljemål:</span>
          {stationer.map(station => (
            <label key={station} className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={skiljemal.includes(station)} onChange={()=>toggleSkiljemal(station)} disabled={!skiljemal.includes(station) && skiljemal.length>=3} className="rounded border-primary-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-primary-700">St {station}</span>
            </label>
          ))}
          <span className="text-xs text-primary-500 ml-2">(max 3 st)</span>
        </div>
        <button onClick={addCompetition} className={`bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm ${!user ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!user}>Lägg till</button>
      </div>
      {!user && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-200">Logga in för att lägga till/ändra/tar bort deltävlingar.</p>}

      <div className="space-y-1">
        {competitions.map(c => (
          <div key={c.id} className="py-4 px-4 bg-primary-50 rounded-lg border border-primary-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {editId===c.id ? (
              <>
                <input value={editName} onChange={e=>setEditName(e.target.value)} className="border border-primary-300 p-2 rounded-lg flex-1 mb-2 md:mb-0" />
                <input type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} className="border border-primary-300 p-2 rounded-lg flex-1 mb-2 md:mb-0" />
                <div className="flex gap-2 items-center mb-2">
                  <span className="font-medium text-primary-700">Skiljemål:</span>
                  {stationer.map(station=> (
                    <label key={station} className="flex items-center gap-1 text-sm">
                      <input type="checkbox" checked={editSkiljemal.includes(station)} onChange={()=>toggleEditSkiljemal(station)} disabled={!editSkiljemal.includes(station) && editSkiljemal.length>=3} className="rounded border-primary-300 text-primary-600 focus:ring-primary-500" />
                      <span className="text-primary-700">St {station}</span>
                    </label>
                  ))}
                  <span className="text-xs text-primary-500 ml-2">(max 3 st)</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={!user} className={`bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}>Spara</button>
                  <button onClick={cancelEdit} className="bg-primary-200 hover:bg-primary-300 text-primary-700 px-3 py-2 rounded-lg font-medium transition-colors">Avbryt</button>
                </div>
              </>
            ) : (
              <>
                <span className="font-medium flex-1 text-primary-800">{c.name}</span>
                <span className="text-primary-600 flex-1">{c.date}</span>
                <span className="flex-1 text-primary-700 text-sm">Skiljemål: {c.skiljemal ? c.skiljemal.map(s=>`St ${s}`).join(', ') : '–'}</span>
                <div className="flex gap-2">
                  <button onClick={()=>startEdit(c)} disabled={!user} className={`bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-2 rounded-lg font-medium transition-colors ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}>Ändra</button>
                  <button onClick={()=>removeCompetition(c.id)} disabled={!user} className={`bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg font-medium transition-colors ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}>Ta bort</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
// --- Shooters component ---
function Shooters({ shooters, user }) {
  const [search, setSearch] = useState('');
  const filteredShooters = shooters.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.club.toLowerCase().includes(search.toLowerCase()) || String(s.startNumber).includes(search));
  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [klass, setKlass] = useState('öppen');
  const [confirmation, setConfirmation] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editClub, setEditClub] = useState('');
  const [editKlass, setEditKlass] = useState('öppen');

  const addShooter = async () => {
    if (!name || !club) return;
    try {
      let newStartNumber;
      const shooterName = name;
      await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'shooter');
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) throw new Error('Shooter counter document does not exist!');
        newStartNumber = counterDoc.data().currentNumber + 1;
        const newShooterRef = doc(collection(db, 'shooters'));
        transaction.set(newShooterRef, { name: shooterName, club, klass, startNumber: newStartNumber });
        transaction.update(counterRef, { currentNumber: newStartNumber });
      });
      setConfirmation({ name: shooterName, startNumber: newStartNumber });
      setTimeout(()=>setConfirmation(null), 5000);
      setName(''); setClub('');
    } catch (e) {
      console.error('Transaction failed:', e);
      alert('Kunde inte lägga till skytt, försök igen.');
    }
  };

  const startEdit = (s) => { setEditId(s.id); setEditName(s.name); setEditClub(s.club); setEditKlass(s.klass); };
  const saveEdit = async () => { if (!user) return alert('Du måste vara inloggad!'); if (!editName || !editClub) return; await updateDoc(doc(db, 'shooters', editId), { name: editName, club: editClub, klass: editKlass }); setEditId(null); setEditName(''); setEditClub(''); setEditKlass('öppen'); };
  const cancelEdit = () => { setEditId(null); setEditName(''); setEditClub(''); setEditKlass('öppen'); };
  const removeShooter = async (id) => { if (!user) return alert('Du måste vara inloggad!'); if (!window.confirm('Ta bort skytten?')) return; await deleteDoc(doc(db, 'shooters', id)); };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-6 text-primary-800 flex items-center gap-3"><UsersIcon className="w-6 h-6"/> Registrera ny skytt</h2>
      {confirmation && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
          <strong className="font-semibold">Ny skytt registrerad:</strong>
          <span className="block sm:inline ml-2">Namn: {confirmation.name}, Startnummer: {confirmation.startNumber}</span>
          <button onClick={()=>setConfirmation(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">✕</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Namn" className="border border-primary-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
        <input value={club} onChange={e=>setClub(e.target.value)} placeholder="Ort" className="border border-primary-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
        <select value={klass} onChange={e=>setKlass(e.target.value)} className="border border-primary-300 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors">
          <option>öppen</option>
Due to message size limits the file is continued in the next message...