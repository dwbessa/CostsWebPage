import { useNavigate } from "react-router-dom"

import ProjectForm from "../project/ProjectForm"

import styles from "./NewProject.module.css"

function NewProject() {
    const navigate = useNavigate()

    function createPost(project) {
        // Initialize cost and services
        project.cost = 0
        project.services = []

        fetch(`${process.env.REACT_APP_API_URL}/projects`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify(project),
        })
        .then((resp) => {
            if (!resp.ok) {
                throw new Error('Failed to create project');
            }
            return resp.json();
        })
        .then((data) => {
            const state = { message: "Projeto criado com sucesso!" }
            navigate('/projects', { state })
        })
        .catch(err => {
            console.error("Error creating project:", err);
            alert("Erro ao criar projeto. Tente novamente.");
        });
    }

    return (
        <div className={styles.newproject_container}>
            <h1>Criar Projeto</h1>
            <p>Crie seu projeto para depois adicionar os serviços</p>
            <ProjectForm handleSubmit={createPost} btnText="Criar Projeto" />
        </div>
    )
}

export default NewProject