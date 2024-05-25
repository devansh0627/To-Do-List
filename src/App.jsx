import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { SunIcon, MoonIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';

function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({ title: '', description: '', dueDate: '' });
  const [editing, setEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dateError, setDateError] = useState('');
  const [titleError, setTitleError] = useState('');
  const backendUrl=import.meta.env.VITE_URL||'http://localhost:3000/';
  useEffect(() => {
    axios.get(backendUrl+'tasks')
      .then(response => {
        const updatedTasks = response.data.map(t => ({
          ...t,
          status: getStatus(t.dueDate)
        }));
        setTasks(updatedTasks);
      })
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  const getStatus = (dueDate) => {
    const today = dayjs().startOf('day');
    const due = dayjs(dueDate).startOf('day');

    if (due.isBefore(today)) {
      return 'completed';
    } else if (due.isSame(today)) {
      return 'in-progress';
    } else {
      return 'pending';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedTask = { ...task, status: getStatus(task.dueDate) };
     if(!task.title){
      setTitleError('Please enter a title.');
      return;
     }
     if(!task.dueDate){
      setDateError('Please enter a due date.');
      return;
     }
    if (editing) {
      axios.put(backendUrl+`tasks/${task.id}`, updatedTask)
        .then(response => {
          setTasks(tasks.map(t => t.id === task.id ? response.data : t));
          setEditing(false);
          setTask({ title: '', description: '', dueDate: '' });
        })
        .catch(error => console.error('Error updating task:', error));
    } else {
      axios.post(backendUrl+'tasks', updatedTask)
        .then(response => setTasks([...tasks, response.data]))
        .catch(error => console.error('Error creating task:', error));
    }
  };

  const handleEdit = (task) => {
    setTask(task);
    setEditing(true);
  };

  const handleDelete = (id) => {
    axios.delete(backendUrl+`tasks/${id}`)
      .then(() => setTasks(tasks.filter(t => t.id !== id)))
      .catch(error => console.error('Error deleting task:', error));
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${darkMode ? 'from-gray-900 to-gray-800' : 'from-gray-100 to-blue-50'} flex flex-col items-center p-6 transition-all duration-500`}>
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>To-Do List</h1>
        <button onClick={toggleTheme} className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition">
          {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
      </div>
      <form onSubmit={handleSubmit} className={`${darkMode ? 'bg-gray-700' : 'bg-white'} border border-black border-solid p-6 rounded-lg shadow-lg w-full max-w-lg mb-8 transition-all duration-500`}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={task.title}
            onChange={(e) => {
              setTask({ ...task, title: e.target.value });
              if (!e.target.value.trim()) {
                setTitleError('Please enter a title.');
              } else {
                setTitleError('');
              }
            }}
            className="w-full p-3 border font-semibold border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          {titleError && <div className="flex items-center font-semibold text-red-500 pt-5 text-sm"><img className='h-5 w-5' src="error.svg" alt="error" />{titleError}</div>}
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Description"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            className="w-full p-3 border font-semibold border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
        <div className="mb-4">
          <input
            type="date"
            value={task.dueDate}
            onChange={(e) => {
              setTask({ ...task, dueDate: e.target.value });
              if (!e.target.value.trim()) {
                setDateError('Please enter a due date.');
              } else {
                setDateError('');
              }
            }}
            className={`w-full p-3 border font-semibold ${darkMode ? 'border-gray-600 focus:ring-blue-400' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2`}
          />
          {dateError && <div className="flex items-center text-red-500 pt-5 text-sm"><img className='h-5 w-5' src="error.svg" alt="error" />{dateError}</div>}
        </div>
        <button type="submit" className={`w-full ${darkMode ? 'bg-blue-800 hover:bg-blue-900' : 'bg-blue-500 hover:bg-blue-600'} text-white p-3 rounded-lg transition`}>
          {editing ? 'Update Task' : 'Create Task'}
        </button>
      </form>
      <ul className="w-full max-w-lg space-y-4">
        {tasks.map(task => (
          <li key={task.id} className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center transition-all duration-500`}>
            <div>
              <h2 className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-xl font-bold`}>{task.title}</h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{task.description}</p>
              <p className={`text-sm font-semibold ${task.status === 'completed' ? (darkMode ? 'text-green-400' : 'text-green-600') :
                task.status === 'in-progress' ? (darkMode ? 'text-yellow-400' : 'text-yellow-600') :
                  (darkMode ? 'text-red-400' : 'text-red-600')
                }`}>

                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </p>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.dueDate}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button onClick={() => handleEdit(task)} className="bg-yellow-500 dark:bg-yellow-400 text-white p-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-500 transition">
                <PencilIcon className="h-5 w-5" />
              </button>
              <button onClick={() => handleDelete(task.id)} className="bg-red-500 dark:bg-red-400 text-white p-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-500 transition">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
