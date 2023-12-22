import { useState } from 'react'
import styles from './Form.module.css'

function Form () {

  function cadastrarUsuario(e) {
    e.preventDefault()
    console.log("Sucesso!")
    console.log(`Usuário ${name} foi cadastrado com a senha ${password}`)
  }
  const [name, setName] = useState()
  const [password, setPassword] = useState()

  return (
    <div>
      <h1>Meu cadastro:</h1>
      <form onSubmit={cadastrarUsuario}>
        <div>
          <label htmlFor='name'>Nome: </label>
          <input 
            className={styles.placeholder} 
            type="text" 
            id="name" 
            name="name" 
            placeholder="Digite o seu nome"
            onChange={(e) => setName(e.target.value)}
          />
        </div> 
        <div>
          <label htmlFor='password'>Senha: </label>
         <input 
          className={styles.placeholder} 
          type="password"
          id="password"
          name="password" 
          placeholder="Digite a sua senha" 
          onChange={(e) => setPassword(e.target.value)}
        />
        </div>
        <div> 
          <input type="submit" value="Cadastrar" />
        </div>
      </form>
    </div>
    )
}

export default Form