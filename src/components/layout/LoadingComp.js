import loading from "../../img/loading.svg"

import styles from "./LoadingComp.module.css"

function LoadingComp () {
  return (
    <div className={styles.loader_container}>
      <img className={styles.loader} src={loading} alt="Loading" />
    </div>
  )
}

export default LoadingComp