import React, { useContext, useState } from 'react';
import '../assets/style/Project-form.css';
import Header from '../components/Header';
import '../assets/style/Header.css';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateProjectForm = () => {
    const { user } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [nbmembers, setNbmembers] = useState('');
    const [deadline, setDeadline] = useState('');
    const [techused, setTechused] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const navigate=useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        const projectData = {
            title,
            nbmembers: Number(nbmembers),
            deadline,
            techused,
            description,
            client: user?.user?._id || ''
        };

        console.log("Submitting project:", projectData);

        const response = await fetch('/projects/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        const json = await response.json();

        if (!response.ok) {
            setError(json.error || "Something went wrong");
        } else {
            setError(null);
            // Clear form
            setTitle('');
            setNbmembers('');
            setDeadline('');
            setTechused('');
            setDescription('');
            navigate('/myproject')
            
        }
    };

    return (
        <>
            <div className='header'>
                <Header />
            </div>
            <div className="form-container">
                <h1>Create your project</h1>
                <p>Turn your ideas into action—create your project now!</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Project name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        type="number"
                        name="nbmembers"
                        placeholder="Members needed"
                        value={nbmembers}
                        onChange={(e) => setNbmembers(e.target.value)}
                    />
                    <input
                        type="date"
                        name="deadline"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                    <input
                        type="text"
                        name="techused"
                        placeholder="Technologies used"
                        value={techused}
                        onChange={(e) => setTechused(e.target.value)}
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                    <button type="submit">Create</button>
                    {error && <div className="error">{error}</div>}
                </form>
            </div>
        </>
    );
};

export default CreateProjectForm;
