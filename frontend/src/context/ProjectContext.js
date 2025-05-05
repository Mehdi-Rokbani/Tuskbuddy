import { createContext, useReducer } from "react";
export const ProjectContext = createContext();

export const projectReducer = (state, action) => {
    switch (action.type) {
        case 'Aff_Project':
            return {
                projects: action.payload
            }
        case 'create':
            return {
                projects: [action.payload, ...state.projects]
            }
        default:
            return state
    }
}


export const ProjectContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(projectReducer, {
        projects: null
    })
    return (
        <ProjectContext.Provider value={{...state, dispatch }}>
            {{ children }}
        </ProjectContext.Provider>
    )

}