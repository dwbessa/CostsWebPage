import { v4 as uuidv4 } from "uuid"

import styles from "./Project.module.css"

import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"

import LoadingComp from "../layout/LoadingComp"
import Container from "../layout/Container"
import ProjectForm from "../project/ProjectForm"
import ServiceForm from "../service/ServiceForm"
import ServiceCard from "../service/ServiceCard"
import Message from "../layout/Message"

function Project() {
  const { id } = useParams()

  const [project, setProject] = useState([])
  const [services, setServices] = useState([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [message, setMessage] = useState()
  const [type, setType] = useState()

  useEffect(() => {
    setTimeout(() => {
      fetch(`${process.env.REACT_APP_API_URL}/projects/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      })
        .then(resp => {
          if (!resp.ok) {
            throw new Error('Failed to fetch project');
          }
          return resp.json();
        })
        .then((data) => {
          setProject(data)
          setServices(data.services)
        })
        .catch((err) => {
          console.error("Error fetching project:", err);
          setMessage('Erro ao carregar projeto!');
          setType('error');
        });
    }, 300)
  }, [id])
  
  function editPost(project) {
    setMessage('')
    // Budget validation
    if (project.budget < project.cost) {
      setMessage('O orçamento não pode ser menor que o custo do projeto!')
      setType('error')
      return false
    }

    fetch(`${process.env.REACT_APP_API_URL}/projects/${project.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify(project),
    })
    .then(resp => {
      if (!resp.ok) {
        throw new Error('Failed to update project');
      }
      return resp.json();
    })
    .then((data) => {
      setProject(data)
      setShowProjectForm(false)
      setMessage('Projeto Atualizado!')
      setType('success')
    })
    .catch(err => {
      console.error("Error updating project:", err);
      setMessage('Erro ao atualizar projeto!');
      setType('error');
    });
  }

  function createService(project) {
    setMessage('')
    setType('')
    
    const lastService = project.services[project.services.length - 1]

    lastService.id = uuidv4()

    const lastServiceCost = lastService.cost
    const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost)

    if (newCost > parseFloat(project.budget)) {
      setMessage('Orçamento ultrapassado, verifique o valor do serviço')
      setType('error')
      project.services.pop()
      return false
    }

    project.cost = newCost

    fetch(`${process.env.REACT_APP_API_URL}/projects/${project.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify(project)
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to add service');
        }
        return resp.json();
      })
      .then((data) => {
        setServices(data.services)
        setProject(data)
        setShowServiceForm(false)
        setMessage('Serviço Adicionado!')
        setType('success')
      })
      .catch((err) => {
        console.error("Error adding service:", err);
        setMessage('Erro ao adicionar serviço!');
        setType('error');
      });
  }

  function removeService(id, cost) {
    // FIX: Create a new object instead of modifying the existing one
    const projectUpdated = {...project}
    
    projectUpdated.services = project.services.filter(
      (service) => service.id !== id
    )
    
    projectUpdated.cost = parseFloat(projectUpdated.cost) - parseFloat(cost)
    
    fetch(`${process.env.REACT_APP_API_URL}/projects/${projectUpdated.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify(projectUpdated)
    })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error('Failed to remove service');
      }
      return resp.json();
    })
    .then((data) => {
      setProject(data)
      setServices(data.services)
      setMessage('Serviço removido com sucesso!')
      setType('success')
    })
    .catch(err => {
      console.error("Error removing service:", err);
      setMessage('Erro ao remover serviço!');
      setType('error');
    });
  }

  function toggleProjectForm() {
    setShowProjectForm(!showProjectForm)
  }

  function toggleServiceForm() {
    setShowServiceForm(!showServiceForm)
  }

  return (
    <>
      {project.name ? (
        <div className={styles.project_details}>
          <Container customClass="column">
            {message && <Message type={type} msg={message} />}
            <div className={styles.details_container}>
              <h1>Projeto: {project.name}</h1>
              <button className={styles.btn} onClick={toggleProjectForm}>
                {!showProjectForm ? 'Editar Projeto' : 'Fechar'}
              </button>
              {!showProjectForm ? (
                <div className={styles.project_info}>
                  <p>
                    <span>Categoria:</span> {project.category.name}
                  </p>
                  <p>
                    <span>Total de Orçamento:</span> R${project.budget}
                  </p>
                  <p>
                    <span>Total Utilizado:</span> R${project.cost}
                  </p>
                </div>
              ) : (
                <div className={styles.project_info}>
                  <ProjectForm
                    handleSubmit={editPost}
                    btnText="Concluir edição"
                    projectData={project}
                  />
                </div>
              )}
            </div>
            <div className={styles.service_form_container}>
                <h2>Adicione um serviço:</h2>
                <button className={styles.btn} onClick={toggleServiceForm}>
                {!showServiceForm ? 'Adicionar serviço' : 'Fechar'}
                </button>
                <div className={styles.project_info}>
                  {showServiceForm && (
                    <ServiceForm 
                      handleSubmit={createService}
                      btnText="Adicionar Serviço"
                      projectData={project}
                    />
                  )}
                </div>
            </div>
            <h2>Serviços</h2>
            <Container customClass="start">
              {services.length > 0 && 
                services.map((service) => (
                  <ServiceCard 
                    id={service.id}
                    name={service.name}
                    cost={service.cost}
                    description={service.description}
                    key={service.id}
                    handleRemove={removeService}
                  />
                ))}
              {services.length === 0 && (
                <p>Não há serviços cadastrados!</p>
              )}
            </Container>
          </Container>
        </div>
      ) : (
        <LoadingComp />
      )}
    </>
  )
}

export default Project