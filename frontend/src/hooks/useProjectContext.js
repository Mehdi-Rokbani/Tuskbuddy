import { ProjectContext } from "../context/ProjectContext";
import { useContext } from "react";

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('ProjectContext must be used inside and ProjectContextProvider')
    }
    return context
}