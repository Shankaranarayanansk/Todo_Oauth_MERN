import React, { useEffect, useState, useCallback } from 'react';
import './Todo.css';
import { Toaster, toast } from 'sonner';
import Modal from 'react-modal';
import img from '../assets/img.png';
import { FcGoogle } from "react-icons/fc";

// Hardcoded API URL - replace with your actual API URL
const apiUrl = "http://localhost:9000";

const Todo = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [token, setToken] = useState(null);
  const [logoutModalIsOpen, setLogoutModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getItems = useCallback(() => {
    if (!token) {
      toast.error("No token found. Please log in.");
      return;
    }
  
    setIsLoading(true);
    fetch(`${apiUrl}/todos`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            const errorMessage = `HTTP error! status: ${res.status}`;
            throw new Error(errorMessage);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error("Received data is not an array:", data);
          setItems([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        toast.error(error.message || "Failed to fetch tasks. Please try again.");
        setItems([]);
        if (error.message.includes('Unauthorized')) {
          localStorage.removeItem('token');
          setToken(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      localStorage.setItem('token', tokenFromUrl);
      window.history.replaceState({}, document.title, "/");
    } else {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      console.log('Token exists, fetching items');
      getItems();
    } else {
      console.log('No token found');
    }
  }, [token, getItems]);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
  
    if (title.trim() !== "" && description.trim() !== "" && domain.trim() !== "") {
      const method = editMode ? "PUT" : "POST";
      const url = editMode ? `${apiUrl}/todos/${currentItemId}` : `${apiUrl}/todos`;
  
      fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, domain })
      })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Unauthorized: Please log in again');
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (editMode) {
          setItems(items.map(item => item._id === currentItemId ? data : item));
        } else {
          setItems([...items, data]);
        }
        toast.success(editMode ? "Task Updated Successfully" : "Task Added Successfully");
        setTitle('');
        setDescription('');
        setDomain('');
        setError(null);
        setEditMode(false);
        setCurrentItemId(null);
      })
      .catch((error) => {
        console.error("Error submitting task:", error);
        toast.error(error.message || "An error occurred");
        if (error.message.includes('Unauthorized')) {
          localStorage.removeItem('token');
          setToken(null);
        }
      });
    } else {
      toast.error("All fields are required");
    }
  };

  const handleDelete = (id) => {
    fetch(`${apiUrl}/todos/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then((res) => {
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      // Remove the deleted item from the state
      setItems(items.filter(item => item._id !== id));
      toast.success("Task Deleted Successfully");
      closeModal();
    }).catch((error) => {
      console.error("Error deleting task:", error);
      toast.error(error.message || "An error occurred");
      if (error.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        setToken(null);
      }
    });
  };

  const handleUpdate = (id) => {
    const item = items.find(item => item._id === id);
    setTitle(item.title);
    setDescription(item.description);
    setDomain(item.domain);
    setEditMode(true);
    setCurrentItemId(id);
  };

  const openModal = (id) => {
    setItemToDelete(id);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setItemToDelete(null);
  };

  const handleLogin = () => {
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleLogout = () => {
    setLogoutModalIsOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setItems([]);
    setLogoutModalIsOpen(false);
  };

  const cancelLogout = () => {
    setLogoutModalIsOpen(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Please login to use the Todo App</h1>
          <button className="login-button" onClick={handleLogin}><FcGoogle />Login with Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="image-container">
        <img src={img} alt="Todo App" />
      </div>
      <div className="main-content">
        <div className="header">
          <button onClick={handleLogout} className='logout'>Logout</button>
          <h1>Crud MERN To Do APP</h1>
        </div>
        <h3>{editMode ? "Edit Task" : "Add a new task"}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder='Title'
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <input
            type="date"
            placeholder='Date'
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
          <input
            type="text"
            placeholder='Domain'
            onChange={(e) => setDomain(e.target.value)}
            value={domain}
          />
          <button type="submit">{editMode ? "Update" : "Add"}</button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="task-table">
          <div className="task-header">
            <span>Title</span>
            <span>Date</span>
            <span>Domain</span>
            <span>Actions</span>
          </div>
          <ul>
            {Array.isArray(items) && items.length > 0 ? (
              items.map((item) => (
                <li key={item._id}>
                  <span>{item.title}</span>
                  <span>{item.description}</span>
                  <span>{item.domain}</span>
                  <div>
                    <button onClick={() => openModal(item._id)}>Delete</button>
                    <button onClick={() => handleUpdate(item._id)}>Update</button>
                  </div>
                </li>
              ))
            ) : (
              <li>No tasks available</li>
            )}
          </ul>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Delete Confirmation"
        ariaHideApp={false}
      >
        <h2>Confirm Delete</h2>
        <button onClick={() => handleDelete(itemToDelete)}>Yes, Delete</button>
        <button onClick={closeModal}>Cancel</button>
      </Modal>
      <Modal
        isOpen={logoutModalIsOpen}
        onRequestClose={cancelLogout}
        contentLabel="Logout Confirmation"
        ariaHideApp={false}
      >
        <h2>Are you sure you want to logout?</h2>
        <button onClick={confirmLogout}>Yes, Logout</button>
        <button onClick={cancelLogout}>Cancel</button>
      </Modal>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Todo;
