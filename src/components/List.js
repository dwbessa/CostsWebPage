import Item from "./Item"

function List() {
    return(
        <>
            <h1>Minha Lista</h1>
            <ul>
              <Item marca="Ferrari" ano_lancamento={1985}/>
              <Item marca="Ford"  ano_lancamento={1985}/>
              <Item marca="Renault"  ano_lancamento={1985}/>
              <Item />
            </ul>
        </>
    )
}

export default List