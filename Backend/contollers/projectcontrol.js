const project = require('../models/Project');
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoose = require('mongoose')

// Create a new project
const register = async (req, res) => {
    const { title, description, client, deadline, nbmembers, techused } = req.body;
    // Check for missing required fields
    if (!title) {
        return res.status(400).json({ error: "Project title is required." });
    }
    if (!client) {
        return res.status(400).json({ error: "Client ID is required." });
    }
    if (!deadline) {
        return res.status(400).json({ error: "Deadline is required." });
    }
    if (!description) {
        return res.status(400).json({ error: "description is required." });
    }
    if (!nbmembers) {
        return res.status(400).json({ error: "members number are required." });
    }
    if (!techused) {
        return res.status(400).json({ error: "technolgies used are required." });
    }

    try {
        // Validate client ID format
        if (!mongoose.Types.ObjectId.isValid(client)) {
            return res.status(400).json({ error: "Invalid client ID format." });
        }

        // Validate deadline
        const parsedDeadline = new Date(deadline);
        if (isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({ error: "Invalid deadline format. Use YYYY-MM-DD." });
        }
        if (parsedDeadline < new Date()) {
            return res.status(400).json({ error: "Deadline must be a future date." });
        }

        // Create a new project
        const newProject = await project.create({
            title,
            description: description || "", // Default to empty string if undefined
            client,
            deadline: parsedDeadline,
            techused,
            nbmembers

        });

        res.status(201).json({ message: "Project created successfully.", project: newProject });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




//get all projects
const allProjects = async (req, res) => {
    const projet = await project.find({}).sort({ createdAt: -1 })
    res.status(200).json({ message: 'all projects', projet })
    if (!projet) {
        res.status(400).json({ error: 'there is no projects' })
    }
}
//get one user
const oneProject = async (req, res) => {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Project ID." });
    }

    try {
        // Fetch project by ID
        const aProject = await project.findById(id);

        // Check if project exists
        if (!aProject) {
            return res.status(404).json({ error: "No project found with this ID." });
        }

        res.status(200).json(aProject);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while retrieving the project." });
    }
};
// Search projects by owner (client) ID
const ProjectOwner = async (req, res) => {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Project ID." });
    }

    try {
        // Fetch projects by owner (client) ID
        const projects = await project.find({ client: id });

        // If no projects found, return an empty array
        if (!projects || projects.length === 0) {
            return res.status(200).json([]); // Empty array instead of an error
        }

        res.status(200).json(projects); // If projects are found, return them
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while retrieving the projects." });
    }
};


//update project
const updateproject = async (req, res) => {
    const { id } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid project ID." });
    }

    try {
        
        const updatedProject = await project.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found." });
        }

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "An error occurred while updating the project." });
    }
};


//delete project
const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        // Find and delete the user
        const deleteProject = await project.findByIdAndDelete(id);

        // Check if the user exists
        if (!deleteProject) {
            return res.status(404).json({ error: "No project found with this ID." });
        }

        res.status(200).json({ message: "project deleted successfully.", project: deleteProject });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while deleting the project." });
    }
};
/*const joinProject=async (req,res) =>{
    const {id,}
}*/

module.exports = { register, allProjects, oneProject, deleteProject, updateproject, ProjectOwner };
