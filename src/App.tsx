import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CloudSun,
  Droplets,
  Leaf,
  Menu,
  Plus,
  Search,
  Sprout,
  Sun,
  TrendingUp,
  TriangleAlert,
  Users,
  Wind,
  X,
} from 'lucide-react';
import { supabase } from './lib/supabase';

type Task = {
  id: string;
  title: string;
  category: string;
  due_label: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
};

const navItems = [
  { label: 'Overview', icon: Sprout },
  { label: 'My fields', icon: Leaf },
  { label: 'Crop health', icon: TrendingUp },
  { label: 'Weather', icon: CloudSun },
  { label: 'Resources', icon: CalendarDays },
];

const crops = [
  { name: 'Tomatoes', field: 'North Field', progress: 72, color: '#d8754f', status: 'Flowering', harvest: '18 days' },
  { name: 'Sweet corn', field: 'East Field', progress: 48, color: '#d6a83e', status: 'Vegetative', harvest: '34 days' },
  { name: 'Lettuce', field: 'Greenhouse 01', progress: 86, color: '#5d956c', status: 'Ready soon', harvest: '6 days' },
];

const fallbackTasks: Task[] = [
  { id: '1', title: 'Inspect irrigation lines', category: 'Irrigation', due_label: 'Today · 10:00 AM', priority: 'high', completed: false },
  { id: '2', title: 'Apply organic fertilizer to North Field', category: 'Crop care', due_label: 'Tomorrow', priority: 'medium', completed: false },
  { id: '3', title: 'Review pest monitoring traps', category: 'Crop health', due_label: 'Friday', priority: 'low', completed: false },
];

function App() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(fallbackTasks);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      const { data, error } = await supabase
        .from('farm_tasks')
        .select('id, title, category, due_label, priority, completed')
        .order('completed', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        setTaskError('Using your starter checklist while the task list reconnects.');
      } else if (data) {
        setTasks(data as Task[]);
      }
      setLoadingTasks(false);
    };

    void loadTasks();
  }, []);

  const completedTasks = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);

  const toggleTask = async (task: Task) => {
    const nextCompleted = !task.completed;
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: nextCompleted } : item));
    const { error } = await supabase.from('farm_tasks').update({ completed: nextCompleted }).eq('id', task.id);
    if (error) {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: task.completed } : item));
      setTaskError('That update did not save. Please try again.');
    }
  };

  const addTask = async () => {
    const title = newTask.trim();
    if (!title) return;

    const { data, error } = await supabase
      .from('farm_tasks')
      .insert({ title, category: 'General', due_label: 'Today', priority: 'medium' })
      .select('id, title, category, due_label, priority, completed')
      .maybeSingle();

    if (error || !data) {
      setTaskError('We could not add that task right now.');
      return;
    }

    setTasks((current) => [...current, data as Task]);
    setNewTask('');
    setIsTaskModalOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand-mark"><span>f</span></div>
        <div className="brand-copy"><strong>fieldwise</strong><small>smart farming</small></div>
        <button className="mobile-close" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu"><X size={20} /></button>

        <div className="farm-switcher">
          <div className="farm-avatar">RS</div>
          <div><strong>Riverbend Farm</strong><span>Coastal Valley</span></div>
          <ChevronRight size={16} />
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setIsSidebarOpen(false); }}>
              <Icon size={18} strokeWidth={activeNav === label ? 2.4 : 1.8} />
              <span>{label}</span>
              {label === 'Crop health' && <span className="nav-badge">2</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><Users size={18} /></div><strong>Need a second opinion?</strong><p>Chat with a local crop expert.</p><button>Find an expert <ChevronRight size={14} /></button></div>
          <button className="settings-link"><span className="avatar-small">AL</span><span>Alex Morgan</span><ChevronRight size={15} /></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>Overview</strong></div>
          <div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={19} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button><div className="top-avatar">AM</div></div>
        </header>

        <div className="page-container">
          <section className="welcome-row"><div><p className="eyebrow">MONDAY, OCTOBER 28, 2026</p><h1>Good morning, Alex.</h1><p className="welcome-sub">Here is what is happening around Riverbend Farm today.</p></div><button className="outline-button"><CalendarDays size={17} /> View calendar</button></section>

          {activeNav !== 'Overview' && <div className="section-notice"><Sprout size={18} /><span><strong>{activeNav}</strong> is ready to explore. Your key farm insights remain on the overview.</span></div>}

          <section className="insight-grid">
            <article className="weather-card card"><div className="card-heading"><div><p className="eyebrow">YOUR LOCAL WEATHER</p><h2>Coastal Valley</h2></div><CloudSun className="weather-icon" size={32} /></div><div className="weather-main"><strong>24°</strong><div><span>Partly cloudy</span><small>Feels like 25°</small></div></div><div className="weather-details"><span><Wind size={15} /> 12 km/h</span><span><Droplets size={15} /> 64%</span><span><Sun size={15} /> UV 5</span></div><div className="weather-footer"><span>Great conditions for field work</span><ChevronRight size={16} /></div></article>
            <article className="metric-card card"><div className="card-heading"><div><p className="eyebrow">FARM HEALTH</p><h2>Looking good</h2></div><div className="health-ring"><span>84</span><small>/100</small></div></div><p className="muted">Your overall farm health is up <strong className="green-text">8%</strong> this week.</p><div className="health-bar"><span /></div><div className="metric-foot"><span>Last updated 8 min ago</span><button>See details <ChevronRight size={14} /></button></div></article>
            <article className="alert-card card"><div className="card-heading"><div><p className="eyebrow">ATTENTION NEEDED</p><h2>2 crop alerts</h2></div><div className="alert-icon"><TriangleAlert size={19} /></div></div><div className="alert-item"><span className="dot orange" /><div><strong>Early blight risk</strong><small>North Field · Tomatoes</small></div><ChevronRight size={16} /></div><div className="alert-item"><span className="dot yellow" /><div><strong>Soil moisture low</strong><small>East Field · Sweet corn</small></div><ChevronRight size={16} /></div><button className="text-button">Review all alerts <ChevronRight size={14} /></button></article>
          </section>

          <div className="content-grid">
            <section className="panel crops-panel"><div className="panel-header"><div><p className="eyebrow">WHAT IS GROWING</p><h2>Crop overview</h2></div><button className="text-button">View all crops <ChevronRight size={14} /></button></div><div className="crop-list">{crops.map((crop) => <div className="crop-row" key={crop.name}><div className="crop-symbol" style={{ background: `${crop.color}18`, color: crop.color }}><Leaf size={19} /></div><div className="crop-info"><div className="crop-title"><strong>{crop.name}</strong><span>{crop.field}</span></div><div className="progress-track"><span style={{ width: `${crop.progress}%`, background: crop.color }} /></div></div><div className="crop-stage"><strong>{crop.progress}%</strong><span>{crop.status}</span></div><div className="crop-harvest"><small>Harvest in</small><strong>{crop.harvest}</strong></div></div>)}</div></section>

            <section className="panel tasks-panel"><div className="panel-header"><div><p className="eyebrow">STAY ON TRACK</p><h2>Today&apos;s tasks</h2></div><button className="add-button" onClick={() => setIsTaskModalOpen(true)}><Plus size={16} /> Add task</button></div><div className="task-summary"><span><strong>{completedTasks}</strong> of {tasks.length} complete</span><div className="mini-progress"><span style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }} /></div></div><div className="task-list">{loadingTasks ? <p className="empty-message">Loading your checklist…</p> : tasks.map((task) => <button className={`task-row ${task.completed ? 'done' : ''}`} key={task.id} onClick={() => void toggleTask(task)}><span className="check-circle">{task.completed && <Check size={13} />}</span><span className="task-copy"><strong>{task.title}</strong><small>{task.category} · {task.due_label}</small></span><span className={`priority ${task.priority}`}>{task.priority}</span></button>)}</div>{taskError && <p className="task-error">{taskError}</p>}<button className="all-tasks-button">Open task list <ChevronRight size={15} /></button></section>
          </div>

          <section className="bottom-banner"><div className="banner-art"><Sprout size={26} /></div><div><p className="eyebrow">SEASONAL INSIGHT</p><h2>Small changes, better harvests.</h2><p>Mulching your tomato rows this week could help retain up to 30% more soil moisture.</p></div><button className="outline-button light">Read the guide <ChevronRight size={15} /></button></section>
          <footer><span>Fieldwise</span><span>Built for better growing</span><span>Data refreshed just now</span></footer>
        </div>
      </main>

      {isTaskModalOpen && <div className="modal-backdrop" onClick={() => setIsTaskModalOpen(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">NEW TASK</p><h2>Add to your day</h2></div><button className="icon-button" onClick={() => setIsTaskModalOpen(false)} aria-label="Close"><X size={18} /></button></div><label>What needs doing?<input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void addTask(); }} placeholder="e.g. Check the greenhouse vents" /></label><div className="modal-actions"><button className="outline-button" onClick={() => setIsTaskModalOpen(false)}>Cancel</button><button className="primary-button" onClick={() => void addTask()}>Add task</button></div></div></div>}
    </div>
  );
}

export default App;
