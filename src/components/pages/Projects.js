import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

import Message from "../layout/Message"
import Container from "../layout/Container"
import LinkButton from "../layout/LinkButton"
import LoadingComp from "../layout/LoadingComp"
import ProjectCard from "../project/ProjectCard"

import styles from "./Projects.module.css"

function Projects() {
  const [projects, setProjects] = useState([])
  const [removeLoading, setRemoveLoading] = useState(false)
  const [projectMessage, setProjectMessage] = useState('')
  const [type, setType] = useState('success')

  const location = useLocation()
  let message = ''
  if(location.state) {
    message = location.state.message
  }

  useEffect(() => {
    setTimeout(() => {
      fetch(`${process.env.REACT_APP_API_URL}/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      }).then(resp => {
        if (!resp.ok) {
          throw new Error('Network response was not ok');
        }
        return resp.json();
      })
      .then(data => {
        setProjects(data)
        setRemoveLoading(true)
      })
      .catch((err) => {
        console.error("Error fetching projects:", err)
        setProjectMessage('Erro ao carregar projetos!')
        setType('error')
        setRemoveLoading(true)
      })
    }, 300)
  }, [])

  function removeProject(id) {
    fetch(`${process.env.REACT_APP_API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin'
    })
    .then(resp => {
      if (!resp.ok) {
        throw new Error('Network response was not ok');
      }
      return resp.json();
    })
    .then(data => {
      setProjects(projects.filter((project) => project.id !== id))
      setProjectMessage('Projeto removido com sucesso!')
      setType('success')
    })
    .catch((err) => {
      console.error('Error:', err);
      setProjectMessage('Erro ao remover projeto!')
      setType('error')
    })
  }

  return (
    <div className={styles.project_container}>
      <div className={styles.title_container}>
        <h1>Meus Projetos</h1>
        <LinkButton to="/newproject" text="Criar Projeto" />
      </div>
      {message && <Message type="success" msg={message} />}
      {projectMessage && <Message type={type} msg={projectMessage} />}
      <Container customClass="start">
        {projects.length > 0 &&
          projects.map((project) => (
            <ProjectCard 
              id={project.id}
              name={project.name}
              budget={project.budget}
              category={project.category.name}
              key={project.id}
              handleRemove={removeProject}
            />
          ))}
          {!removeLoading && <LoadingComp />}
          {removeLoading && projects.length === 0 && (
            <p>Não há projetos cadastrados!</p>
          )}
      </Container>
    </div>
  ) 
}

export default Projects