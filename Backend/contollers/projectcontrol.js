const Project = require('../models/Project');
const Team=require('../models/Team');
const Task=require('../models/Tasks')
const mongoose = require('mongoose');

// Create a new project
const register = async (req, res) => {
    const { title, description, client, startDate, deadline, nbmembers, techused } = req.body;

    // Validate required fields
    const requiredFields = { title, description, client, startDate, deadline, nbmembers, techused };
    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
            return res.status(400).json({ error: `${field} is required.` });
        }
    }

    try {
        // Validate client ID format
        if (!mongoose.Types.ObjectId.isValid(client)) {
            return res.status(400).json({ error: "Invalid client ID format." });
        }

        // Validate techused is an array with at least one item
        if (!Array.isArray(techused) || techused.length === 0) {
            return res.status(400).json({ error: "At least one technology must be specified." });
        }

        // Validate number of members (between 1 and 20)
        if (nbmembers < 1 || nbmembers > 20) {
            return res.status(400).json({ error: "Number of members must be between 1 and 20." });
        }

        // Validate dates
        const parsedStartDate = new Date(startDate);
        const parsedDeadline = new Date(deadline);
        
        if (isNaN(parsedStartDate.getTime())) {
            return res.status(400).json({ error: "Invalid start date format. Use YYYY-MM-DD." });
        }

        if (isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({ error: "Invalid deadline format. Use YYYY-MM-DD." });
        }

        
        

        // Validate deadline is after start date
        if (parsedDeadline <= parsedStartDate) {
            return res.status(400).json({ error: "Deadline must be after the start date." });
        }

        // Create project
        const newProject = await Project.create({
            title,
            description,
            client,
            startDate: parsedStartDate,
            deadline: parsedDeadline,
            techused,
            nbmembers
        });

        res.status(201).json({ 
            message: "Project created successfully.", 
            project: newProject 
        });

    } catch (error) {
        console.error("Project creation error:", error);
        res.status(500).json({ 
            error: "Server error during project creation.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// Get all projects
const allProjects = async (req, res) => {
    try {
        const projects = await Project.find({})
            .sort({ createdAt: -1 })
            .lean();

        if (!projects.length) {
            return res.status(200).json([]);
        }

        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Server error while fetching projects." });
    }
};

// Get single project
const oneProject = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Project ID format." });
    }

    try {
        const project = await Project.findById(id).lean();

        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: "Server error while fetching project." });
    }
};
// Update project
const updateproject = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid project ID." });
    }

    try {
        // Validate nbmembers if present
        if (updates.nbmembers && (updates.nbmembers < 1 || updates.nbmembers > 20)) {
            return res.status(400).json({ error: "Number of members must be between 1 and 20." });
        }

        // Parse and validate deadline and startdate
        let newDeadline, newStartDate;

        if (updates.deadline) {
            newDeadline = new Date(updates.deadline);
            if (isNaN(newDeadline.getTime())) {
                return res.status(400).json({ error: "Invalid deadline format." });
            }
            updates.deadline = newDeadline;
        }

        if (updates.startDate) {
            newStartDate = new Date(updates.startDate);
            if (isNaN(newStartDate.getTime())) {
                return res.status(400).json({ error: "Invalid start date format." });
            }
            updates.startDate = newStartDate;
        }

        // Ensure startdate is before deadline if both are provided
        if (newStartDate && newDeadline && newStartDate >= newDeadline) {
            return res.status(400).json({ error: "Start date must be before deadline." });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found." });
        }

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ 
            error: "Server error during update.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// Delete project
const deleteProject = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid project ID." });
    }

    try {
        // Check for associated teams
        const teamExists = await Team.exists({ projectId: id });
        if (teamExists) {
            return res.status(400).json({ 
                error: "Cannot delete project with active team. Delete the team first." 
            });
        }

        // Check for associated tasks
        const tasksExist = await Task.exists({ projectId: id });
        if (tasksExist) {
            return res.status(400).json({ 
                error: "Cannot delete project with existing tasks. Delete tasks first." 
            });
        }

        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({ error: "Project not found." });
        }

        res.status(200).json({ 
            message: "Project deleted successfully.",
            project: deletedProject 
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ 
            error: "Server error during deletion.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// Get projects by owner (client) ID
const ProjectOwner = async (req, res) => {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Client ID format." });
    }

    try {
        const projects = await Project.find({ client: id })
            .sort({ createdAt: -1 })
            .lean();

        // Always return an array (empty if no projects)
        res.status(200).json(projects);

    } catch (error) {
        console.error("Error fetching owner projects:", error);
        res.status(500).json({ 
            error: "Server error while fetching projects.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { 
    register, 
    allProjects, 
    oneProject, 
    deleteProject, 
    updateproject, 
    ProjectOwner 
};