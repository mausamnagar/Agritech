import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  Map,
  Menu,
  Plus,
  Search,
  ShieldAlert,
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

const fieldDetails = [
  { name: 'North Field', area: '4.2 acres', crop: 'Tomatoes', health: 'Good', moisture: 64, color: '#d8754f' },
  { name: 'East Field', area: '7.8 acres', crop: 'Sweet corn', health: 'Watch', moisture: 38, color: '#d6a83e' },
  { name: 'Greenhouse 01', area: '0.8 acres', crop: 'Lettuce', health: 'Excellent', moisture: 71, color: '#5d956c' },
];

const forecast = [
  { day: 'Today', date: 'Oct 28', icon: CloudSun, high: '24°', low: '16°', rain: '10%' },
  { day: 'Tue', date: 'Oct 29', icon: Sun, high: '26°', low: '17°', rain: '5%' },
  { day: 'Wed', date: 'Oct 30', icon: CloudRain, high: '22°', low: '15°', rain: '55%' },
  { day: 'Thu', date: 'Oct 31', icon: CloudSun, high: '23°', low: '14°', rain: '20%' },
  { day: 'Fri', date: 'Nov 01', icon: Sun, high: '25°', low: '16°', rain: '8%' },
];

const resources = [
  { type: 'Guide', title: 'A practical guide to early blight', detail: 'Crop health · 6 min read', icon: BookOpen },
  { type: 'Checklist', title: 'Weekly irrigation maintenance', detail: 'Irrigation · 8 steps', icon: Check },
  { type: 'Video', title: 'Building healthier soil naturally', detail: 'Soil health · 12 min watch', icon: Sprout },
];

function App() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [selectedField, setSelectedField] = useState('North Field');
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
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
          <div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={19} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button><div className="top-avatar">AM</div></div>
        </header>

        <div className="page-container">
          <section className="welcome-row"><div><p className="eyebrow">MONDAY, OCTOBER 28, 2026</p><h1>{activeNav === 'Overview' ? 'Good morning, Alex.' : activeNav}</h1><p className="welcome-sub">{activeNav === 'Overview' ? 'Here is what is happening around Riverbend Farm today.' : `Manage your ${activeNav.toLowerCase()} from one clear workspace.`}</p></div><button className="outline-button"><CalendarDays size={17} /> View calendar</button></section>

          {activeNav === 'Overview' ? <OverviewView tasks={tasks} completedTasks={completedTasks} loadingTasks={loadingTasks} taskError={taskError} toggleTask={toggleTask} openTaskModal={() => setIsTaskModalOpen(true)} /> : <WorkspaceView activeNav={activeNav} selectedField={selectedField} setSelectedField={setSelectedField} />}

          <footer><span>Fieldwise</span><span>Built for better growing</span><span>Data refreshed just now</span></footer>
        </div>
      </main>

      {isTaskModalOpen && <div className="modal-backdrop" onClick={() => setIsTaskModalOpen(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">NEW TASK</p><h2>Add to your day</h2></div><button className="icon-button" onClick={() => setIsTaskModalOpen(false)} aria-label="Close"><X size={18} /></button></div><label>What needs doing?<input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void addTask(); }} placeholder="e.g. Check the greenhouse vents" /></label><div className="modal-actions"><button className="outline-button" onClick={() => setIsTaskModalOpen(false)}>Cancel</button><button className="primary-button" onClick={() => void addTask()}>Add task</button></div></div></div>}
    </div>
  );
}

type OverviewViewProps = {
  tasks: Task[];
  completedTasks: number;
  loadingTasks: boolean;
  taskError: string;
  toggleTask: (task: Task) => Promise<void>;
  openTaskModal: () => void;
};

function OverviewView({ tasks, completedTasks, loadingTasks, taskError, toggleTask, openTaskModal }: OverviewViewProps) {
  return <>
    <section className="insight-grid">
      <article className="weather-card card"><div className="card-heading"><div><p className="eyebrow">YOUR LOCAL WEATHER</p><h2>Coastal Valley</h2></div><CloudSun className="weather-icon" size={32} /></div><div className="weather-main"><strong>24°</strong><div><span>Partly cloudy</span><small>Feels like 25°</small></div></div><div className="weather-details"><span><Wind size={15} /> 12 km/h</span><span><Droplets size={15} /> 64%</span><span><Sun size={15} /> UV 5</span></div><div className="weather-footer"><span>Great conditions for field work</span><ChevronRight size={16} /></div></article>
      <article className="metric-card card"><div className="card-heading"><div><p className="eyebrow">FARM HEALTH</p><h2>Looking good</h2></div><div className="health-ring"><span>84</span><small>/100</small></div></div><p className="muted">Your overall farm health is up <strong className="green-text">8%</strong> this week.</p><div className="health-bar"><span /></div><div className="metric-foot"><span>Last updated 8 min ago</span><button>See details <ChevronRight size={14} /></button></div></article>
      <article className="alert-card card"><div className="card-heading"><div><p className="eyebrow">ATTENTION NEEDED</p><h2>2 crop alerts</h2></div><div className="alert-icon"><TriangleAlert size={19} /></div></div><div className="alert-item"><span className="dot orange" /><div><strong>Early blight risk</strong><small>North Field · Tomatoes</small></div><ChevronRight size={16} /></div><div className="alert-item"><span className="dot yellow" /><div><strong>Soil moisture low</strong><small>East Field · Sweet corn</small></div><ChevronRight size={16} /></div><button className="text-button">Review all alerts <ChevronRight size={14} /></button></article>
    </section>
    <div className="content-grid">
      <section className="panel crops-panel"><div className="panel-header"><div><p className="eyebrow">WHAT IS GROWING</p><h2>Crop overview</h2></div><button className="text-button">View all crops <ChevronRight size={14} /></button></div><div className="crop-list">{crops.map((crop) => <div className="crop-row" key={crop.name}><div className="crop-symbol" style={{ background: `${crop.color}18`, color: crop.color }}><Leaf size={19} /></div><div className="crop-info"><div className="crop-title"><strong>{crop.name}</strong><span>{crop.field}</span></div><div className="progress-track"><span style={{ width: `${crop.progress}%`, background: crop.color }} /></div></div><div className="crop-stage"><strong>{crop.progress}%</strong><span>{crop.status}</span></div><div className="crop-harvest"><small>Harvest in</small><strong>{crop.harvest}</strong></div></div>)}</div></section>
      <section className="panel tasks-panel"><div className="panel-header"><div><p className="eyebrow">STAY ON TRACK</p><h2>Today&apos;s tasks</h2></div><button className="add-button" onClick={openTaskModal}><Plus size={16} /> Add task</button></div><div className="task-summary"><span><strong>{completedTasks}</strong> of {tasks.length} complete</span><div className="mini-progress"><span style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }} /></div></div><div className="task-list">{loadingTasks ? <p className="empty-message">Loading your checklist…</p> : tasks.map((task) => <button className={`task-row ${task.completed ? 'done' : ''}`} key={task.id} onClick={() => void toggleTask(task)}><span className="check-circle">{task.completed && <Check size={13} />}</span><span className="task-copy"><strong>{task.title}</strong><small>{task.category} · {task.due_label}</small></span><span className={`priority ${task.priority}`}>{task.priority}</span></button>)}</div>{taskError && <p className="task-error">{taskError}</p>}<button className="all-tasks-button">Open task list <ChevronRight size={15} /></button></section>
    </div>
    <section className="bottom-banner"><div className="banner-art"><Sprout size={26} /></div><div><p className="eyebrow">SEASONAL INSIGHT</p><h2>Small changes, better harvests.</h2><p>Mulching your tomato rows this week could help retain up to 30% more soil moisture.</p></div><button className="outline-button light">Read the guide <ChevronRight size={15} /></button></section>
  </>;
}

type WorkspaceViewProps = { activeNav: string; selectedField: string; setSelectedField: (field: string) => void };

function WorkspaceView({ activeNav, selectedField, setSelectedField }: WorkspaceViewProps) {
  const [healthFilter, setHealthFilter] = useState('All');
  const [forecastDay, setForecastDay] = useState('Today');
  const [resourceFilter, setResourceFilter] = useState('All');

  if (activeNav === 'My fields') return <>
    <div className="workspace-toolbar"><div className="tab-pills"><span className="tab-pill active">All fields</span><span className="tab-pill">Needs attention</span></div><button className="add-button"><Plus size={16} /> Add field</button></div>
    <div className="field-grid">{fieldDetails.map((field) => <button className={`field-card ${selectedField === field.name ? 'selected' : ''}`} key={field.name} onClick={() => setSelectedField(field.name)}><div className="field-image" style={{ background: `linear-gradient(135deg, ${field.color}40, #dce8d5)` }}><Map size={25} /><span>{field.area}</span></div><div className="field-card-body"><div><p className="eyebrow">{field.crop}</p><h2>{field.name}</h2></div><span className={`health-label ${field.health.toLowerCase()}`}>{field.health}</span><div className="field-stat"><span>Soil moisture</span><strong>{field.moisture}%</strong></div><div className="progress-track"><span style={{ width: `${field.moisture}%`, background: field.color }} /></div></div></button>)}</div>
    <section className="panel selected-field-panel"><div className="panel-header"><div><p className="eyebrow">SELECTED FIELD</p><h2>{selectedField}</h2></div><button className="text-button">Open field details <ChevronRight size={14} /></button></div><div className="field-detail-grid"><div><span>Crop</span><strong>{fieldDetails.find((field) => field.name === selectedField)?.crop}</strong></div><div><span>Area</span><strong>{fieldDetails.find((field) => field.name === selectedField)?.area}</strong></div><div><span>Last inspection</span><strong>Today, 8:40 AM</strong></div><div><span>Next action</span><strong>Inspect irrigation</strong></div></div></section>
  </>;

  if (activeNav === 'Crop health') {
    const visibleCrops = healthFilter === 'All' ? crops : crops.filter((crop) => healthFilter === 'Healthy' ? crop.progress > 70 : crop.progress <= 70);
    return <><div className="workspace-toolbar"><div><p className="eyebrow">FIELD MONITORING</p><h2 className="view-title">Crop health at a glance</h2></div><div className="filter-pills">{['All', 'Healthy', 'Watch'].map((filter) => <button className={healthFilter === filter ? 'selected' : ''} onClick={() => setHealthFilter(filter)} key={filter}>{filter}</button>)}</div></div><div className="health-summary-grid"><div className="health-score panel"><Gauge size={25} /><strong>84</strong><span>Overall health score</span><small>+8% from last week</small></div><div className="health-score panel"><ShieldAlert size={25} /><strong>2</strong><span>Active observations</span><small>Both need review</small></div><div className="health-score panel"><Droplets size={25} /><strong>58%</strong><span>Average soil moisture</span><small>Within target range</small></div></div><section className="panel"><div className="panel-header"><div><p className="eyebrow">CROP MONITORING</p><h2>Current crop status</h2></div><button className="text-button">Log observation <Plus size={14} /></button></div><div className="health-table">{visibleCrops.map((crop) => <div className="health-table-row" key={crop.name}><div className="crop-symbol" style={{ background: `${crop.color}18`, color: crop.color }}><Leaf size={19} /></div><div className="health-name"><strong>{crop.name}</strong><span>{crop.field}</span></div><div className="health-meter"><span style={{ width: `${crop.progress}%`, background: crop.color }} /><small>{crop.progress}%</small></div><span className={`health-label ${crop.progress > 70 ? 'good' : 'watch'}`}>{crop.progress > 70 ? 'Healthy' : 'Watch'}</span><ChevronRight size={16} /></div>)}</div></section></>;
  }

  if (activeNav === 'Weather') return <><div className="weather-hero panel"><div><p className="eyebrow">COASTAL VALLEY · LIVE CONDITIONS</p><h2>Clear windows for field work</h2><p>Conditions are calm through the afternoon with a chance of rain moving in Wednesday.</p></div><div className="large-temperature"><CloudSun size={38} /><strong>24°</strong><span>Partly cloudy</span></div></div><section className="panel"><div className="panel-header"><div><p className="eyebrow">5-DAY OUTLOOK</p><h2>Plan your week</h2></div><div className="filter-pills">{forecast.map((item) => <button className={forecastDay === item.day ? 'selected' : ''} onClick={() => setForecastDay(item.day)} key={item.day}>{item.day}</button>)}</div></div><div className="forecast-row">{forecast.map((item) => { const Icon = item.icon; return <button className={`forecast-card ${forecastDay === item.day ? 'selected' : ''}`} onClick={() => setForecastDay(item.day)} key={item.day}><strong>{item.day}</strong><small>{item.date}</small><Icon size={27} /><b>{item.high}</b><span>{item.low}</span><em><Droplets size={12} /> {item.rain}</em></button>; })}</div></section></>;

  const visibleResources = resourceFilter === 'All' ? resources : resources.filter((resource) => resource.type === resourceFilter);
  return <><div className="resource-intro panel"><div><p className="eyebrow">FIELDWISE LIBRARY</p><h2>Practical knowledge for better growing.</h2><p>Short, useful resources built around the decisions you make every day on the farm.</p></div><BookOpen size={34} /></div><div className="workspace-toolbar"><div className="filter-pills">{['All', 'Guide', 'Checklist', 'Video'].map((filter) => <button className={resourceFilter === filter ? 'selected' : ''} onClick={() => setResourceFilter(filter)} key={filter}>{filter}</button>)}</div><button className="text-button">Saved resources <ChevronRight size={14} /></button></div><div className="resource-grid">{visibleResources.map((resource) => { const Icon = resource.icon; return <button className="resource-card" key={resource.title}><div className="resource-icon"><Icon size={21} /></div><p className="eyebrow">{resource.type}</p><h2>{resource.title}</h2><span>{resource.detail}</span><b>Open resource <ChevronRight size={14} /></b></button>; })}</div></>;
}

export default App;
