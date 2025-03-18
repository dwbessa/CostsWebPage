import { useEffect, useState } from "react"

import Input from "../form/Input"
import Select from "../form/Select"
import SubmitButton from "../form/SubmitButton"

import styles from "./ProjectForm.module.css"

function ProjectForm ({ handleSubmit, btnText, projectData }) {

  const [categories, setCategories] = useState([])
  const [project, setProject] = useState(projectData || [])
  const [error, setError] = useState('') // Added for error handling

  useEffect(() => {
    // Debug API URL
    console.log("API URL:", process.env.REACT_APP_API_URL)
    
    fetch(`${process.env.REACT_APP_API_URL}/categories`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch categories');
        }
        return resp.json();
      })
      .then((data) => {
        console.log("Categories loaded:", data) // Debug categories data
        setCategories(data)
      })
      .catch((err) => {
        console.error("Error fetching categories:", err)
        setError('Failed to load categories. Please check server connection.')
      })
  }, [])

  const submit = (e) => {
    e.preventDefault()
    // Clone project to avoid direct mutation
    const projectToSubmit = {...project}
    handleSubmit(projectToSubmit)
  }

  function handleChange(e) {
    // Sanitize inputs to prevent XSS
    const value = e.target.name === 'name' ? 
                  e.target.value.replace(/<[^>]*>?/gm, '') : 
                  e.target.value;
                  
    setProject({ ...project, [e.target.name]: value })
  }

  function handleCategory(e) {
    // Debug the selection
    console.log("Category selected:", e.target.value)
    console.log("Option text:", e.target.options[e.target.selectedIndex].text)
    
    setProject({ 
      ...project, 
      category: {
        id: e.target.value,
        name: e.target.options[e.target.selectedIndex].text,
      },
    })
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <Input 
        type="text"
        text="Nome do Projeto"
        name="name"
        placeholder="Insira o nome do projeto"
        handleOnChange={handleChange}
        value={project.name ? project.name : ''} 
      />
      <Input 
        type="number"
        text="Insira o Orçamento do Projeto"
        name="budget"
        placeholder="Insira o orçamento total"
        handleOnChange={handleChange}
        value={project.budget ? project.budget : ''}
      />
      <Select 
        name="category_id" 
        text="Selecione a Categoria"
        options={categories}
        handleOnChange={handleCategory}
        value={project.category ? project.category.id : ''} 
      />
      <SubmitButton text={btnText}/>
    </form>
  )
}

export default ProjectForm